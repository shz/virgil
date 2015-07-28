var ast = require('../../ast')
  , types = require('../../types')
  ;

exports.literal = function(node) {
  switch (node.constructor) {
    case ast.TrueLiteral:
      return 'true';
    case ast.FalseLiteral:
      return 'false';
    case ast.NullLiteral:
      return 'nil';
    case ast.DefaultLiteral:
      return this.convert((types.builtin[node.type.name] || {}).default || new ast.NilLiteral());
    case ast.StringLiteral:
      return '"' + node.value.replace(/\r/g, '\\r')
                             .replace(/\n/g, '\\n')
                             .replace(/\t/g, '\\t')
                 + '"';
    case ast.IntegerLiteral:
      return node.value.toString();
    case ast.FloatLiteral:
      var f = node.value.toString();
      if (f.indexOf('.') < 0) {
        f += '.0';
      }
      return f;

    default:
      node.throw('Don\'t know how to convert a ', node.constructor.name);
  }
};
