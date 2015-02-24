var types = require('../../lib/types')
  , ast = require('../../lib/ast')
  ;

var name = function(node) {
  return node.constructor.name + ' (line ' + node.loc.start.line + ')';
};

module.exports = function(input, callback) {
  types.realize(input);

  // Ensure that each expression node has a type
  ast.traverse(input, function(node) {
    if (node instanceof ast.Expression) {
      if (!node.type) {
        throw new Error('Node ' + name(node) + ' is missing .type');
      }
      if (!node.type.builtin && !node.type.isGeneric && !node.type.def) {
        throw new Error('Node ' + name(node) + ' missing .type.def (' + node.type.toString() + ')');
      }
    }
  });

  callback(input);
};
