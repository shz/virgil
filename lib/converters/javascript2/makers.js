var ast = require('../../ast')
  , renameUnnaturalMethod = require('./rename_unnatural_method')
  ;

exports.makeFunction = function(node, makeNaturalMethod) {
  var name = node.name;
  var args = node.args;
  var body = convert(node.body);

  // If we're in method mode, turn the first arg into `this`
  if (makeNaturalMethod) {
    body.body.unshift({
      type: 'VariableDeclaration',
      kind: 'var',
      declarations: [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: args[0][0] },
        init: { type: 'ThisExpression' }
      }]
    });
    args = args.slice(1);

  // Rename non-natural methods to include the type they're defined
  // on to avoid conflicts.  Separate
  } else if (node instanceof ast.MethodStatement) {
    name = renameUnnaturalMethod(node);
  }

  return {
    type: makeNaturalMethod ? 'FunctionExpression' : 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: name
    },
    params: args.map(function(pair) {
      return {
        type: 'Identifier',
        name: pair[0]
      }
    }),
    body: body
  };
};

//
// Makes a JS variable name from a module node
//
var makeModuleReferenceName = exports.makeModuleReference = function(moduleNode) {
  throw new Error('TODO'); // node.originModuleNode.path.replace(/\.vgl/, ''))
};

//
// Creates a reference to the specified AST node.  This node can be
// a function, method, variable, struct...
//
exports.makeReference = function(node) {
  var name = node.name;
  // If we're accessing not-natural methods, we need to use their
  // correct name.
  if (node instanceof ast.MethodStatement && !node.nat) {
    name = renameUnnaturalMethod(node);
  }

  // If the node is defined in an extern block, and that extern block
  // uses a namespace, access it via that namespace.
  var namespace = node.extern && node.extern.namespace;
  if (namespace) {
    return {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: namespace },
      property: { type: 'Identifier', name: name }
    }
  }

  // Base case, just refer to the node by name
  var ret = { type: 'Identifier', name: name };

  // If the node originated in another module via an import, reference
  // that import.
  if (node.originModuleNode) {
    ret = {
      type: 'MemberExpression',
      computed: false,
      property: ret,
      object: this.getIdentifierForModule(node.originModuleNode)
    };
  }

  // Shadowed variables need to have their shadow count appended to
  // wind up with the correct name.
  if (node.jsShadowCount) {
    ret.name = ret.name + '$' + node.jsShadowCount;
  }

  return ret;
};
