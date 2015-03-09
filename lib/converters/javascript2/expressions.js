exports.binary = function(type, node) {
  return {
    type: 'BinaryExpression',
    operator: type,
    left: this.convert(node.left),
    right: this.convert(node.right)
  };
};

exports.unary = function(type, node) {
  return {
    type: 'UnaryExpression',
    operator: type,
    argument: this.convert(node.expression),
    prefix: true
  };
};
