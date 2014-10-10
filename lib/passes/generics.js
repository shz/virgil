var ast = require('../ast');

var doThrow = function(message, node) {
  var err = new Error(message);
  err.start = node.loc.start;
  err.end = node.loc.end;
  throw err;
};

var extractGenericsFromType = function(type) {
  var l = [];

  if (type.isGeneric)
    l.push(type.name);

  for (var i=0; i<type.generics.length; i++)
    l = l.concat(extractGenericsFromType(type.generics[i]));

  return l;
};

var check = function(allowed, gens, node) {
  for (var i=0; i<gens.length; i++)
    if (allowed.indexOf(gens[i]) == -1)
      doThrow('Undeclared generic type ' + gens[i], node);
};

var checkGenerics = function(node) {
  var allowed = [];
  allowed.push([]);
  var cur = allowed[0];

  var push = function(l, node) {
    // console.log('push');
    for (var i=0; i<l.length; i++)
      if (cur.indexOf(l[i]) >= 0)
        doThrow('Generic type name "' + l[i] + '" is already in use', node);
    cur = allowed[allowed.length - 1].concat(l);
    allowed.push(cur);
  };
  var pop = function() {
    // console.log('pop');
    allowed.pop();
    cur = allowed[allowed.length - 1];
  };

  ast.traverse(node, function(node) {
    switch (node.constructor) {
      case ast.StructStatement:
        push(node.generics, node);
        break;


      case ast.MethodStatement:
      case ast.FunctionStatement:
        var gens = [];
        node.args.forEach(function(a) {
          gens = gens.concat(extractGenericsFromType(a[1]));
        });
        push(gens, node);

        check(cur, extractGenericsFromType(node.returnType), node);
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        var gens = [];
        if (node.type)
          gens = gens.concat(extractGenericsFromType(node.type));
        if (node.args)
          for (var i=0; i<node.args.length; i++)
            if (node.args[i][1])
              gens = gens.concat(extractGenericsFromType(node.args[i][1]));

        check(cur, gens, node);
        break;
    }

  }, function(node) {
    switch (node.constructor) {
      case ast.StructStatement:
      case ast.FunctionStatement:
      case ast.MethodStatement:
        pop();
        break;
    }
  });
};

module.exports = function(root) {
  checkGenerics(root);
};
