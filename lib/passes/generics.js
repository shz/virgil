var ast = require('../ast');

var doThrow = function(message, node) {
  var err = new Error(message);
  err.start = node.loc.start;
  err.end = node.loc.end;
  throw err;
};


var extractGenericsFromType = function(type) {
  var l = [];

  if (type.name[0] == '\'')
    l.push(type.name);

  for (var i=0; i<type.generics.length; i++)
    l = l.concat(extractGenericsFromType(type.generics[i]));

  return l;
};

var checkGenerics = function(node) {
  var allowed = [];
  allowed.push([]);
  var cur = allowed[0];

  var push = function(l) {
    // console.log('push');
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
        push(node.generics);
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


        for (var i=0; i<gens.length; i++)
          if (cur.indexOf(gens[i]) == -1)
            doThrow('Undeclared generic type ' + gens[i], node);
        break;
    }

  }, function(node) {
    switch (node.constructor) {
      case ast.StructStatement:
        pop();
        break;
    }
  });
};

module.exports = function(root) {
  checkGenerics(root);
};
