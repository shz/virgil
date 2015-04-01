var ast = require('../ast')
  , types = require('../types')
  , Slot = require('./slot')
  ;

var arithmetic = function(op, node, slots) {
  var left = Slot.wrap(expression(node.left, slots)).value;
  var right = Slot.wrap(expression(node.right, slots)).value;
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

    // Identifier lookup
    case ast.Identifier:
      return slots.get(node.name); // returns a Slot

    // Arithmetic
    case ast.NegationExpression:
      var val = expression(node.expression, slots);
      return new val.constructor(-val.value);
    case ast.AdditionExpression:
      return arithmetic('+', node, slots);
    case ast.SubtractionExpression:
      return arithmetic('-', node, slots);
    case ast.MultiplicationExpression:
      return arithmetic('*', node, slots);
    case ast.DivisionExpression:
      return arithmetic('/', node, slots);
    case ast.PowerExpression:
      return arithmetic('**', node, slots);
    case ast.ModExpression:
      return arithmetic('%', node, slots);

    // Lists
    case ast.ListExpression:
      // Not a literal!  We need to resolve at creation time, and create
      // a new ListExpression with realized values.
      return new ast.ListExpression(node.body.map(function(v) {
        return Slot.wrap(expression(v, slots)).value;
      }));

    case ast.ListAccessExpression:
      var left = Slot.wrap(expression(node.left, slots));
      var right = Slot.wrap(expression(node.right, slots));

      // Check bounds
      if (right.value.value < 0 || left.value.body.length <= right.value.value) {
        throw new Error('Index out of range (list length is ' +
          left.value.body.length + ', index is ' + right.value.value);
      }
      return left.value.body[right.value.value];


    default:
      node.throw('Don\'t know how to execute expression ' + node.constructor.name);
  }
};
