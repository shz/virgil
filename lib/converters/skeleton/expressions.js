var ast = require('../../ast');

exports.expression = function(node) {
  switch (node.constructor) {
    case ast.Identifier:

    case ast.EqualsExpression:
    case ast.NotEqualsExpression:
    case ast.GreaterThanExpression:
    case ast.LessThanExpression:
    case ast.GreaterThanEqualExpression:
    case ast.LessThanEqualExpression:
    case ast.LogicalOrExpression:
    case ast.LogicalAndExpression:
    case ast.TernaryExpression:

    case ast.PowerExpression:
    case ast.NotExpression:
    case ast.NegationExpression:
    case ast.MultiplicationExpression:
    case ast.AdditionExpression:
    case ast.SubtractionExpression:
    case ast.DivisionExpression:
    case ast.ModExpression:

    case ast.ListExpression:
    case ast.ListAccessExpression:

    case ast.NewExpression:
    case ast.PropertyAccessExpression:

    case ast.LambdaExpression:
    case ast.FunctionCallExpression:

    default:
      node.throw('Don\'t know how to convert a ' + node.constructor.name);
  }
};
