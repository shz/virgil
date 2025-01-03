//
// Verify proper generic usage
//

var ast = require('../ast');

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
    if (allowed.indexOf(gens[i]) == -1) {
      var message = 'Undeclared generic type ' + gens[i];
      if (node && node.throw) {
        node.throw(message);
      } else {
        throw new Error(message);
      }
    }
};

var checkGenerics = function(node) {
  var allowed = [];
  allowed.push([]);
  var cur = allowed[0];

  var push = function(l, node) {
    // console.log('push');
    for (var i=0; i<l.length; i++)
      if (cur.indexOf(l[i]) >= 0)
        node.throw('Generic type name "' + l[i] + '" is already in use');
    cur = allowed[allowed.length - 1].concat(l);
    allowed.push(cur);
  };
  var pop = function() {
    // console.log('pop');
    allowed.pop();
    cur = allowed[allowed.length - 1];
  };

  var checkDeclaration = function(node) {
    var gens = [];
    if (node.type)
      gens = gens.concat(extractGenericsFromType(node.type));
    if (node.args)
      for (var i=0; i<node.args.length; i++)
        if (node.args[i][1])
          gens = gens.concat(extractGenericsFromType(node.args[i][1]));

    check(cur, gens, node);
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

      case ast.AssignmentBlock:
        node.declarations.forEach(checkDeclaration);
        break;

      case ast.VariableDeclaration:
      case ast.MutableVariableDeclaration:
      case ast.OutVariableDeclaration:
        checkDeclaration(node);
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
