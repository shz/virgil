var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node, parent) {
    if (parent instanceof ast.BlockStatement) {
      if (node instanceof ast.Identifier
      || node instanceof ast.Literal
      || node instanceof ast.PropertyAccessExpression) {
        node.throw('This statement doesn\'t do anything');
      }
    }
  });
};
