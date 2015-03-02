var core = require('./core');

var traverse = module.exports = function(node, enter, exit) {
  if (!exit)
    exit = function() {};

  if (node instanceof Array) {
    for (var i=0; i<node.length; i++)
      traverse(node[i], enter ,exit);
    return;
  }

  var skip = false;
  try {
    skip = enter(node) === false;
  } catch (err) {
    if (!err.loc && node && node.loc) {
      err.loc = node.loc;
    }
    throw err;
  }

  if (!skip) {

    switch (node.constructor) {
      case core.MultiplicationExpression:
      case core.AdditionExpression:
      case core.SubtractionExpression:
      case core.DivisionExpression:
      case core.PowerExpression:
      case core.ModExpression:
      case core.LessThanExpression:
      case core.GreaterThanExpression:
      case core.GreaterThanEqualExpression:
      case core.LessThanEqualExpression:
      case core.AssignmentStatement:
      case core.LogicalOrExpression:
      case core.LogicalAndExpression:
      case core.EqualsExpression:
      case core.NotEqualsExpression:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case core.TernaryExpression:
      case core.IfStatement:
        traverse(node.condition, enter, exit);
        traverse(node.left, enter, exit);
        if (node.right)
          traverse(node.right, enter, exit);
        break;

      case core.FunctionStatement:
      case core.MethodStatement:
        if (node.body)
          traverse(node.body, enter, exit);
        break;

      case core.NegationExpression:
      case core.NotExpression:
      case core.ReturnStatement:
        if (node.expression)
          traverse(node.expression, enter, exit);
        break;

      case core.VariableDeclaration:
      case core.MutableVariableDeclaration:
      case core.OutVariableDeclaration:
        traverse(node.expression, enter, exit);
        break;

      case core.WhileStatement:
        traverse(node.expression, enter, exit);
        traverse(node.body, enter, exit);
        break;
      case core.ForStatement:
        traverse(node.declaration, enter, exit);
        traverse(node.end, enter, exit);
        traverse(node.body, enter, exit);
        break;

      case core.BlockStatement:
      case core.ListExpression:
      case core.Module:
        traverse(node.body, enter, exit);
        break;

      case core.FunctionCallExpression:
        traverse(node.left, enter, exit);
        // Fall through
      case core.NewExpression:
        traverse(node.args, enter, exit);
        break;

      case core.PropertyAccessExpression:
        traverse(node.left, enter, exit);
        break;

      case core.ListAccessExpression:
      case core.TryCatchStatement:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case core.LambdaExpression:
        traverse(node.body, enter, exit);
        break;

      case core.StructStatement:
        traverse(node.body, enter, exit);
        break;

      case core.AssignmentBlock:
        traverse(node.declarations.map(function(d) { return d.expression }), enter, exit);
        break;

      case core.ExternStatement:
        traverse(node.structs, enter, exit);
        traverse(node.methods, enter, exit);
        traverse(node.functions, enter, exit);
        traverse(node.declarations, enter, exit);
        break;

      case core.Identifier:
      case core.NullLiteral:
      case core.TrueLiteral:
      case core.FalseLiteral:
      case core.IntegerLiteral:
      case core.StringLiteral:
      case core.FloatLiteral:
      case core.BreakStatement:
      case core.ContinueStatement:
      case core.ImportStatement:
      case core.DefaultLiteral:
        break;

      default:
        var err = new Error('Don\'t know how to traverse ' + node.constructor.name);
        err.loc = node.loc;
        throw err;
    }
  }

  exit(node);
};