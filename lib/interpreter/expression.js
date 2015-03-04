var ast = require('../ast')
  , types = require('../types')
  ;

var arithmetic = function(op, node) {
  var left = expression(node.left);
  var right = expression(node.right);
  var result = left.value;

  switch (op) {
    case '-': result -= right.value; break;
    case '+': result += right.value; break;
    case '/': result /= right.value; break;
    case '*': result *= right.value; break;
    case '**': result = Math.pow(result, right.value); break;
    case '%': result %= right.value; break;
  }

  switch (left.constructor) {
    case ast.StringLiteral:
      return new ast.StringLiteral(result, true);
    case ast.IntegerLiteral:
      return new ast.IntegerLiteral(result|0);
    case ast.FloatLiteral:
      return new ast.FloatLiteral(result);
  }
};

var expression = module.exports = function expression(node, slots) {
  if (node instanceof ast.Literal) {
    return node;
  }

  switch (node.constructor) {
    case ast.NegationExpression:
      var val = expression(node.expression);
      return new val.constructor(-val.value);
    case ast.AdditionExpression:
      return arithmetic('+', node);
    case ast.SubtractionExpression:
      return arithmetic('-', node);
    case ast.MultiplicationExpression:
      return arithmetic('*', node);
    case ast.DivisionExpression:
      return arithmetic('/', node);
    case ast.PowerExpression:
      return arithmetic('**', node);
    case ast.ModExpression:
      return arithmetic('%', node);

    default:
      node.throw('Don\'t know how to execute expression ' + node.constructor.name);
  }
};
