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
      return this.renamedIdentifiers[node.name] || node.name;

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
      return '[\n'
           + this.indent(node.body.map(this.convert, this).join(',\n'))
           + '\n]'
           ;
    case ast.ListAccessExpression:
      return this.convert(node.left) + '[' + this.convert(node.right) + ']';

    case ast.NewExpression:
      var init = {};
      node.args.declarations.map(function(arg) {
        init[arg.name] = arg.expression;
      });
      if (node.type.builtin) {
        // This is only possible with a list, and list has zero properties
        // so we can leave it blank...
      } else {
        node.type.def.body.declarations.forEach(function(decl) {
          if (!init[decl.name]) {
            init[decl.name] = decl.expression;
          }
        });
      }

      return this.type(node.type) + '(' + Object.keys(init).map(function(name) {
        return name + ': ' + this.convert(init[name]);
      }, this).join(', ') + ')';

    case ast.PropertyAccessExpression:
      return this.convert(node.left) + '.' + this.convert(node.right);

    case ast.LambdaExpression:
      return this.func(node);

    case ast.FunctionCallExpression:
      return this.convert(node.left) + '(' + node.args.map(this.convert, this).join(', ') + ')';

    default:
      node.throw('Don\'t know how to convert a ' + node.constructor.name);
  }
};
