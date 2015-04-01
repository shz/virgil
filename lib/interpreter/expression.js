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

var logic = function(op, node, slots) {
  var left = Slot.wrap(expression(node.left, slots)).value;
  var right = Slot.wrap(expression(node.right, slots)).value;

  var lval = left instanceof ast.Literal ? left.value : left;
  var rval = right instanceof ast.Literal ? right.value : right;
  var result = null;

  switch (op) {
    case '==': result = lval == rval; break;
    case '!=': result = lval != rval; break;
    case '>': result = lval > rval; break;
    case '<': result = lval < rval; break;
    case '>=': result = lval >= rval; break;
    case '<=': result = lval <= rval; break;
    case '||': result = lval || rval; break;
    case '&&': result = lval && rval; break;
  }

  if (result) {
    return new ast.TrueLiteral();
  } else {
    return new ast.FalseLiteral();
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

    // Logic
    case ast.NotExpression:
      var val = Slot.wrap(expression(node.expression, slots)).value;
      if (val.constructor == ast.TrueLiteral) {
        return ast.FalseLiteral;
      } else {
        return ast.TrueLiteral;
      }
    case ast.TernaryExpression:
      if (Slot.wrap(expression(node.condition, slots)).value.constructor == ast.TrueLiteral) {
        return expression(node.left, slots);
      } else {
        return expression(node.right, slots);
      }
    case ast.EqualsExpression:
      return logic('==', node, slots);
    case ast.NotEqualsExpression:
      return logic('!=', node, slots);
    case ast.GreaterThanExpression:
      return logic('>', node, slots);
    case ast.LessThanExpression:
      return logic('<', node, slots);
    case ast.GreaterThanEqualExpression:
      return logic('>=', node, slots);
    case ast.LessThanEqualExpression:
      return logic('<=', node, slots);
    case ast.LogicalOrExpression:
      return logic('||', node, slots);
    case ast.LogicalAndExpression:
      return logic('&&', node, slots);

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
