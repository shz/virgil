var ast = require('../../ast');

var binary = function(node) {
  var op = ({ EqualsExpression: '=='
            , NotEqualsExpression: '!='
            , GreaterThanExpression: '>'
            , LessThanExpression: '<'
            , GreaterThanEqualExpression: '>='
            , LessThanEqualExpression: '<='
            , LogicalOrExpression: '||'
            , LogicalAndExpression: '&&'

            , MultiplicationExpression: '*'
            , AdditionExpression: '+'
            , SubtractionExpression: '-'
            , DivisionExpression: '/'
            , ModExpression: '%'
            })[node.constructor.name];

  return this.convert(node.left) + ' ' + op + ' ' + this.convert(node.right);
};

exports.expression = function(node) {
  switch (node.constructor) {
    case ast.Identifier:
      return node.name;

    case ast.EqualsExpression:
    case ast.NotEqualsExpression:
    case ast.GreaterThanExpression:
    case ast.LessThanExpression:
    case ast.GreaterThanEqualExpression:
    case ast.LessThanEqualExpression:
    case ast.LogicalOrExpression:
    case ast.LogicalAndExpression:
      return binary.call(this, node);

    case ast.TernaryExpression:
      return '(' + this.convert(node.condition)
           + ') ? (' + this.convert(node.left)
           + ') : (' + this.convert(node.right)
           + ')'
           ;

    case ast.NotExpression:
      return '(!' + this.convert(node.expression) + ')';
    case ast.NegationExpression:
      return '(-' + this.convert(node.expression) + ')';

    case ast.PowerExpression:
      return 'pow(' + this.convert(node.left) + ', ' + this.convert(node.right) + ')';

    case ast.MultiplicationExpression:
    case ast.AdditionExpression:
    case ast.SubtractionExpression:
    case ast.DivisionExpression:
    case ast.ModExpression:
      return binary.call(this, node);

    case ast.ListExpression:
      return '[ ' + node.body.map(this.convert, this).join(',\n ') + '\n]';
    case ast.ListAccessExpression:
      return this.convert(node.left) + '[' + this.convert(node.right) + ']';

    case ast.NewExpression:
      return this.type(node.type) + '(' + node.args.declarations.map(function(arg) {
        return arg.name + ': ' + this.convert(arg.expression);
      }, this).join(', ') + ')';

    case ast.PropertyAccessExpression:
      return this.convert(node.left) + '.' + this.convert(node.right);

    case ast.LambdaExpression:
      var returnType = this.type(node.returnType);
      var params = node.args.map(function(arg) {
        return arg[0] + ': ' + this.type(arg[1]);
      }, this).join(', ');
      var body = node.body.body.map(this.convert, this).join('\n');
      if (node.body.body.length > 1) {
        body = '\n' + body + '\n';
      } else {
        body = ' ' + body + ' ';
      }
      return '{(' + params + ') -> ' + returnType + ' in' + body + '}';

    case ast.FunctionCallExpression:
      return this.convert(node.left) + '(' + node.args.map(this.convert, this).join(', ') + ')';

    default:
      node.throw('Don\'t know how to convert a ' + node.constructor.name);
  }
};
