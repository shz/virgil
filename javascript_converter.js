var convert = function(ast) {
  if (!ast)
    return null;

  switch (ast.constructor.name) {
    case 'IfStatement':
      return {
        type: 'IfStatement',
        test: convert(ast.conditional),
        consequent: convert(ast.left),
        alternate: convert(ast.right)
      }

    case 'BlockStatement':
      return {
        type: 'BlockStatement',
        body: ast.body.map(convert)
      }

    case 'TrueExpression':
      return {
        type: 'Literal',
        value: true,
        raw: 'true'
      }

    case 'FalseExpression':
      return {
        type: 'Literal',
        value: false,
        raw: 'false'
      }

    default:
      throw new Error('Don\'t know how to convert ' + ast.constructor.name);
  }
};

module.exports = function(ast) {
  var jsast = {
    type: 'Program',
    body: []
  };

  ast.forEach(function(ast) {
    jsast.body.push(convert(ast));
  });

  return jsast;
};
