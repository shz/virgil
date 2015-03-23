var ast = require('../../ast');

exports.literal = function(node) {
  switch (node.constructor) {
    case ast.TrueLiteral:
      return {
        type: 'Literal',
        value: true,
        raw: 'true'
      };

    case ast.FalseLiteral:
      return {
        type: 'Literal',
        value: false,
        raw: 'false'
      };

    case ast.NullLiteral:
      return {
        type: 'Literal',
        value: null,
        raw: 'null'
      };

    case ast.DefaultLiteral:
      return convert((types.builtin[node.type.name] || {}).default || new syntax.NullLiteral());

    case ast.StringLiteral:
      return {
        type: 'Literal',
        value: node.value.replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, '\\t')
                        ,
        raw: node.value
      };

    case ast.IntegerLiteral:
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };

    case ast.FloatLiteral:
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };


    default:
      node.throw('Don\'t know how to convert a ', node.constructor.name);
  }
};
