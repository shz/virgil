var ast = require('../../ast')
  , types = require('../../types')
  ;

exports.literal = function(node) {
  switch (node.constructor) {
    case ast.TrueLiteral:
    case ast.FalseLiteral:
    case ast.NullLiteral:
    case ast.DefaultLiteral:
      return this.convert((types.builtin[node.type.name] || {}).default || new ast.NilLiteral());
    case ast.StringLiteral:
    case ast.IntegerLiteral:
    case ast.FloatLiteral:

    default:
      node.throw('Don\'t know how to convert a ', node.constructor.name);
  }
};
