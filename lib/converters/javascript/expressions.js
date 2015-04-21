var ast = require('../../ast')
  , types = require('../../types')
  ;

exports.convertBuiltin = function(type) {
  var name = type.name;

  switch (type.name) {
    case 'list':
      name = 'Array';
      break;
    case 'datetime':
      name = '$DateTime';
      this.needDateTime = true;
      break;
  }

  return { type: 'Identifier', name: name };
};

exports.binary = function(type, node) {
  return {
    type: 'BinaryExpression',
    operator: type,
    left: this.convert(node.left),
    right: this.convert(node.right)
  };
};

exports.unary = function(type, node) {
  return {
    type: 'UnaryExpression',
    operator: type,
    argument: this.convert(node.expression),
    prefix: true
  };
};

exports.expression = function(node) {
  switch (node.constructor) {

    case ast.Identifier:
      if (node.def) {
        return this.makeReference(node.def);
      }

      var name = node.name;
      if (node.scope) {
        var defScope = node.scope.search('variable', name);
        if (defScope && defScope.variables[name].jsShadowCount) {
          name = name + '$' + defScope.variables[name].jsShadowCount;
        }
      }

      return { type: 'Identifier', name: name };

    case ast.TernaryExpression:
      return {
        type: 'ConditionalExpression',
        test: this.convert(node.condition),
        consequent: this.convert(node.left),
        alternate: this.convert(node.right)
      };

    case ast.PowerExpression:
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: {
            type: 'Identifier',
            name: 'Math'
          },
          property: {
            type: 'Identifier',
            name: 'pow'
          }
        },
        arguments: [
          this.convert(node.left),
          this.convert(node.right)
        ]
      };

    case ast.NotExpression:
      return this.unary('!', node);
    case ast.NegationExpression:
      return this.unary('-', node);

    case ast.EqualsExpression:
      return this.binary('==', node);
    case ast.NotEqualsExpression:
      return this.binary('!=', node);
    case ast.LogicalOrExpression:
      return this.binary('||', node);
    case ast.LogicalAndExpression:
      return this.binary('&&', node);
    case ast.MultiplicationExpression:
      return this.binary('*', node);
    case ast.AdditionExpression:
      return this.binary('+', node);
    case ast.SubtractionExpression:
      return this.binary('-', node);
    case ast.DivisionExpression:
      var base = this.binary('/', node);

      // Integer division must be truncated, but javascript
      // converts to a float by default.  This re-truncates.
      if (node.left.type == types.canned['int']) {
        return {
          type: 'BinaryExpression',
          operator: '|',
          left: base,
          right: { type: 'Literal', value: 0, raw: '0' }
        };
      }

      // Otherwise, let it do its thing
      return base;

    case ast.ModExpression:
      return this.binary('%', node);
    case ast.GreaterThanExpression:
      return this.binary('>', node);
    case ast.LessThanExpression:
      return this.binary('<', node);
    case ast.GreatherThanEqualExpression:
      return this.binary('>=', node);
    case ast.LessThanEqualExpression:
      return this.binary('<=', node);

    case ast.ListAccessExpression:
      return {
        type: 'MemberExpression',
        computed: true,
        object: this.convert(node.left),
        property: this.convert(node.right)
      };

    case ast.PropertyAccessExpression:
      return {
        type: 'MemberExpression',
        computed: false,
        object: this.convert(node.left),
        property: this.convert(node.right)
      };

    case ast.ListExpression:
      return {
        type: 'ArrayExpression',
        elements: node.body.map(this.convert, this)
      };

    case ast.NewExpression:
      return {
        type: 'NewExpression',
        callee: node.type.builtin ? this.convertBuiltin(node.type) : this.makeReference(node.type.def),
        arguments: node.args.declarations.length ? [this.convert(node.args)] : []
      };

    case ast.LambdaExpression:
      return {
        type: 'FunctionExpression',
        id: null,
        params: node.args.map(function(idDef) {
          return { type: 'Identifier', name: idDef[0] }
        }),
        body: this.convert(node.body)
      };

    case ast.FunctionCallExpression:
      if (!node.left.type) {
        var err = Error('Parser error: Somehow, node has no type! ' + node.left.constructor.name);
        err.start = node.left.loc.start;
        err.end = node.left.loc.end;
        throw err;
      }

      // Handle regular old function call
      if (!node.left.type || node.left.type.name == 'func') {
        return {
          type: 'CallExpression',
          callee: this.convert(node.left),
          arguments: node.args.map(this.convert, this)
        };
      }

      // Methods
      if (node.left.type.name == 'method') {
        var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);

        // Natural methods
        if (m && m.nat) {
          return {
            type: 'CallExpression',
            callee: {
              type: 'MemberExpression',
              computed: false,
              object: this.convert(node.left.left),
              property: { type: 'Identifier', name: node.left.right.name }
            },
            arguments: node.args.map(this.convert, this)
          };

        // Unnatural methods from this module
        } else {
          return {
            type: 'CallExpression',
            callee: this.convert(node.left.right),
            arguments: [node.left.left].concat(node.args).map(this.convert, this)
          };
        }
      }

      node.left.throw('Unknown function call type ' + node.left.type.toString());

    default:
      node.throw('Don\'t know how to convert a ' + node.constructor.name);
  }
};
