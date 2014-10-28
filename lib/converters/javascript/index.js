// Ignoring this file for istanbul, as it's covered by the
// integration tests.

var path = require('path')
  , escodegen = require('escodegen')
  , syntax = require('../../ast')
  , types = require('../../types')
  , propertyMapping = require('../common/property_mapping')
  ;

var statementify = function(node) {
  if (node.type.match(/Literal|Expression|Identifier/)) {
    return {
      type: 'ExpressionStatement',
      expression: node
    };
  } else {
    return node;
  }
};

var binaryExpression = function(type, node) {
  return {
    type: 'BinaryExpression',
    operator: type,
    left: convert(node.left),
    right: convert(node.right)
  };
};

var unaryExpression = function(type, node) {
  return {
    type: 'UnaryExpression',
    operator: type,
    argument: convert(node.expression),
    prefix: true
  };
};

var makeFunction = function(node, makeMethod) {
  var name = node.name;
  var args = node.args;
  var body = convert(node.body)

  // If we're in method mode, turn the first arg into `this`
  if (makeMethod) {
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
  }

  return {
    type: makeMethod ? 'FunctionExpression' : 'FunctionDeclaration',
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

var makeReference = function(node) {
  var namespace = node.extern && node.extern.namespace;
  if (namespace) {
    return {
      type: 'MemberExpression',
      computed: false,
      object: { type: 'Identifier', name: namespace },
      property: { type: 'Identifier', name: node.name }
    }
  }

  return (node.originModule || []).concat([node.name]).reduce(function(prev, cur) {
    if (!prev)
      return { type: 'Identifier', name: cur };

    return {
      type: 'MemberExpression',
      computed: false,
      object: prev,
      property: { type: 'Identifier', name: cur }
    };
  }, null);
};

var convertBuiltin = function(type) {
  var name = type.name;

  switch (type.name) {
    case 'list':
      name = 'Array';
      break;
  }

  return { type: 'Identifier', name: name };
};

/* istanbul ignore next */
var convert = propertyMapping.use(require('./js_map'), function(node, isRootScope) {
  if (!node)
    return null;

  switch (node.constructor.name) {

    case 'IfStatement':
      return {
        type: 'IfStatement',
        test: convert(node.condition),
        consequent: statementify(convert(node.left)),
        alternate: node.right && statementify(convert(node.right))
      };

    case 'TernaryExpression':
      return {
        type: 'ConditionalExpression',
        test: convert(node.condition),
        consequent: convert(node.left),
        alternate: convert(node.right)
      };

    case 'PowerExpression':
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'Identifier',
            name: 'Math'
          },
          property: {
            type: 'Identifier',
            name: 'pow'
          }
        },
        arguments: [
          convert(node.left),
          convert(node.right)
        ]
      };

    case 'NotExpression':
      return unaryExpression('!', node);
    case 'NegationExpression':
      return unaryExpression('-', node);

    case 'EqualsExpression':
      return binaryExpression('==', node);
    case 'NotEqualsExpression':
      return binaryExpression('!=', node);
    case 'LogicalOrExpression':
      return binaryExpression('||', node);
    case 'LogicalAndExpression':
      return binaryExpression('&&', node);
    case 'MultiplicationExpression':
      return binaryExpression('*', node);
    case 'AdditionExpression':
      return binaryExpression('+', node);
    case 'SubtractionExpression':
      return binaryExpression('-', node);
    case 'DivisionExpression':
      var base = binaryExpression('/', node);

      // Integer division must be truncated, but javascript
      // converts to a float by default.  This re-truncates.
      if (node.left.type == types.canned['int']) {
        return {
          type: 'BinaryExpression',
          operator: '|',
          left: base,
          right: { type: 'Literal', value: 0, raw: '0' }
        };
      }

      // Otherwise, let it do its thing
      return base;

    case 'ModExpression':
      return binaryExpression('%', node);
    case 'GreaterThanExpression':
      return binaryExpression('>', node);
    case 'LessThanExpression':
      return binaryExpression('<', node);
    case 'GreatherThanEqualExpression':
      return binaryExpression('>=', node);
    case 'LessThanEqualExpression':
      return binaryExpression('<=', node);

    case 'BlockStatement':
      return {
        type: 'BlockStatement',
        body: node.body.map(convert).map(statementify)
      }

    case 'TrueLiteral':
      return {
        type: 'Literal',
        value: true,
        raw: 'true'
      };

    case 'FalseLiteral':
      return {
        type: 'Literal',
        value: false,
        raw: 'false'
      };

    case 'NullLiteral':
      return {
        type: 'Literal',
        value: null,
        raw: 'null'
      };

    case 'DefaultLiteral':
      return convert((types.builtin[node.type.name] || {}).default || new syntax.NullLiteral());

    case 'StringLiteral':
      return {
        type: 'Literal',
        value: node.value.replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, '\\t')
                        ,
        raw: node.value
      };

    case 'IntegerLiteral':
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };

    case 'FloatLiteral':
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };

    case 'FunctionStatement':
      return makeFunction(node);

    case 'Identifier':
      if (node.def) {
        return makeReference(node.def);
      }
      return { type: 'Identifier', name: node.name };

    case 'ReturnStatement':
      return {
        type: 'ReturnStatement',
        argument: convert(node.expression)
      };

    case 'AssignmentStatement':
      return {
        type: 'AssignmentExpression',
        operator: '=',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'VariableDeclaration':
    case 'OutVariableDeclaration':
    case 'MutableVariableDeclaration':
      return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: node.name
          },
          init: convert(node.expression)
        }]
      };

    case 'AssignmentBlock':
      return {
        type: 'ObjectExpression',
        properties: node.declarations.map(function(d) {
          return {
            type: 'Property',
            kind: 'init',
            key: { type: 'Identifier', name: d.name },
            value: convert(d.expression)
          };
        })
      };

    case 'NewExpression':
      return {
        type: 'NewExpression',
        callee: node.type.builtin ? convertBuiltin(node.type) : makeReference(node.type.def),
        arguments: node.args.declarations.length ? [convert(node.args)] : []
      };

    case 'FunctionCallExpression':
      if (!node.left.type) {
        var err = Error('Parser error: Somehow, node has no type! ' + node.left.constructor.name);
        err.start = node.left.loc.start;
        err.end = node.left.loc.end;
        throw err;
      }

      // Handle regular old function call
      if (!node.left.type || node.left.type.name == 'func') {
        return {
          type: 'CallExpression',
          callee: convert(node.left),
          arguments: node.args.map(convert)
        };
      }

      // Methods
      if (node.left.type.name == 'method') {
        var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);

        // Natural methods
        if (m && m.nat) {
          return {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: convert(node.left.left),
              property: { type: 'Identifier', name: node.left.right.name }
            },
            arguments: node.args.map(convert)
          };

        // Unnatural methods from this module
        } else {
          return {
            type: 'CallExpression',
            callee: convert(node.left.right),
            arguments: [node.left.left].concat(node.args).map(convert)
          };
        }
      }

      throw new Error('Unknown function call type ' + node.left.type.toString());

    case 'MethodStatement':
      var baseName = node.args[0][1].name;

      if (node.nat) {
        return {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            computed: false,
            property: { type: 'Identifier', name: node.name },
            object: {
              type: 'MemberExpression',
              computed: false,
              property: { type: 'Identifier', name: 'prototype' },
              object: { type: 'Identifier', name: baseName}
            }
          },
          right: makeFunction(node, true)
        };

      // Otherwise just make it a function
      } else {
        return makeFunction(node);
      }

    case 'StructStatement':
      return {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: node.name
        },
        params: [{type: 'Identifier', name: 'params'}],
        body: {
          type: 'BlockStatement',
          body: node.body.declarations.map(function(d) {
            return {
              type: 'AssignmentExpression',
              operator: '=',
              left: {
                type: 'MemberExpression',
                computed: false,
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: d.name }
              },
              right: convert(d.expression)
            };
          }).map(statementify).concat([{
            type: 'ForInStatement',
            each: false,
            left: {
              type: 'VariableDeclaration',
              declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'i' },
                init: null
              }],
              kind: 'var'
            },
            right: { type: 'Identifier', name: 'params' },
            body: {
              type: 'IfStatement',
              test: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  computed: false,
                  object: { type: 'Identifier', name: 'params' },
                  property: { type: 'Identifier', name: 'hasOwnProperty' }
                },
                arguments: [{ type: 'Identifier', name: 'i' }]
              },
              consequent: {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '=',
                  left: {
                    type: 'MemberExpression',
                    computed: true,
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'i' }
                  },
                  right: {
                    type: 'MemberExpression',
                    computed: true,
                    object: { type: 'Identifier', name: 'params' },
                    property: { type: 'Identifier', name: 'i' }
                  }
                }
              },
              alternate: null
            }
          }])
        }
      };

    case 'ListAccessExpression':
      return {
        type: 'MemberExpression',
        computed: true,
        object: convert(node.left),
        property: convert(node.right)
      };

    case 'PropertyAccessExpression':
      return {
        type: 'MemberExpression',
        computed: false,
        object: convert(node.left),
        property: convert(node.right)
      };

    case 'ListExpression':
      return {
        type: 'ArrayExpression',
        elements: node.body.map(convert)
      };

    case 'WhileStatement':
      return {
        type: 'WhileStatement',
        test: convert(node.expression),
        body: convert(node.body)
      };

    case 'TryCatchStatement':
      return {
        type: 'TryStatement',
        block: convert(node.left),
        handlers: [{
          type: 'CatchClause',
          param: {
            type: 'Identifier',
            name: 'err'
          },
          body: convert(node.right)
        }],
        finalizer: null
      };

    case 'ForStatement':
      return {
        type: 'ForStatement',
        init: convert(node.declaration),
        test: {
          type: 'BinaryExpression',
          operator: node.up ? '<' : '>',
          left: { type: 'Identifier', name: node.declaration.name },
          right: convert(node.end)
        },
        update: {
          type: 'UpdateExpression',
          operator: node.up ? '++' : '--',
          argument: { type: 'Identifier', name: node.declaration.name },
          prefix: false
        },
        body: convert(node.body)
      };

    case 'BreakStatement':
      return {
        type: 'BreakStatement',
        lable: null
      };

    case 'ContinueStatement':
      return {
        type: 'ContinueStatement',
        lable: null
      };

    case 'LambdaExpression':
      return {
        type: 'FunctionExpression',
        id: null,
        params: node.args.map(function(idDef) {
          return { type: 'Identifier', name: idDef[0] }
        }),
        body: convert(node.body)
      };


    case 'ImportStatement':
      // TODO - Work differently in node mode
    case 'ExternStatement':
      break;

    default:
      throw new Error('Don\'t know how to convert ' + node.constructor.name);
  }
});

/* istanbul ignore next */
var makeNodeModule = function(exp) {
  return [{
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'module' },
        property: { type: 'Identifier', name: 'exports' }
      },
      right: exp
    }
  }];
};

/* istanbul ignore next */
var makeBrowserModule = function(name, exp) {
  var parts = name.replace(/\.vgl$/, '').split(path.sep);

  var body = [];
  var cur = { type: 'Identifier', name: 'window' };
  parts.forEach(function(p) {
    cur = {
      type: 'MemberExpression',
      computed: false,
      object: cur,
      property: { type: 'Identifier', name: p }
    };

    if (p == parts[parts.length -1 ])
      return;

    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: cur,
        right: {
          type: 'LogicalExpression',
          operator: '||',
          left: cur,
          right: {
            type: 'ObjectExpression',
            properties: []
          }
        }
      }
    });
  });

  body.push(statementify({
    type: 'AssignmentExpression',
    operator: '=',
    left: cur,
    right: exp
  }));

  return body;
};

/* istanbul ignore next */
module.exports = function(node, options) {
  // Base JS program
  var jsnode = {
    type: 'Program',
    body: []
  };

  // Convert to the equivalent Javascript AST
  if (node instanceof Array) {
    node.forEach(function(node) {
      var n = convert(node, true);
      if (n)
        jsnode.body.push(statementify(n));
    });
  } else if (node instanceof syntax.Module) {
    // Find exports
    var exports = [];
    node.body.forEach(function(n) {
      // Skip non-exported things
      if (!n.ex)
        return;

      // Skip natural methods
      if (n.constructor == syntax.MethodStatement && n.nat)
        return;

      // Skip externs
      if (n.constructor == syntax.ExternStatement)
        return;

      exports.push({
        type: 'Property',
        key: { type: 'Identifier', name: n.name },
        value: { type: 'Identifier', name: n.name }
      });
    });

    // Build the main body
    var b = [];
    for (var i=0; i<node.body.length; i++) {
      var s = convert(node.body[i]);
      if (s)
        b.push(statementify(s));
    }
    var body = {
      type: 'CallExpression',
      arguments: [],
      callee: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: b.concat([{
            type: 'ReturnStatement',
            argument: {
              type: 'ObjectExpression',
              properties: exports
            }
          }])
        }
      }
    };

    // Package it up depending on node/browser env
    jsnode.body = options.node ? makeNodeModule(body)
                               : makeBrowserModule(node.path, body)
                               ;
  } else {
    throw new Error('Don\'t know how to convert a ' + node.constructor.name + ' to Javascript');
  }

  // console.log(JSON.stringify(jsnode, null, 2));

  // Turn Javascript AST to a string
  var js = escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });

  if (node instanceof syntax.Module) {
    var ret = {};
    ret[node.path.replace(/\.vgl$/, '.js')] = js;
    return ret;
  } else {
    return js;
  }
};
