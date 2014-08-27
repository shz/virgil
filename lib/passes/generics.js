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

var checkGenerics = function(allowed, node) {
  ast.traverse(node, function(node) {
    if (!node.type)
      return;

    var gens = extractGenericsFromType(node.type);
    for (var i=0; i<gens.length; i++)
      if (allowed.indexOf(gens[i]) == -1)
        doThrow('Undeclared generic type ' + gens[i], node);
  });
};

module.exports = function(root) {
  ast.traverse(root, function(node) {
    switch (node.constructor) {
      case ast.StructStatement:
        checkGenerics(node.generics, node);
        break;
    }
  });
};
