var escodegen = require('escodegen')
  ;

var statementify = function(ast) {
  if (ast.type.match(/Literal|Expression|Identifier/)) {
    return {
      type: 'ExpressionStatement',
      expression: ast
    };
  } else {
    return ast;
  }
};

var convert = function(ast) {
  if (!ast)
    return null;

  switch (ast.constructor.name) {
    case 'IfStatement':
      return {
        type: 'IfStatement',
        test: convert(ast.condition),
        consequent: statementify(convert(ast.left)),
        alternate: ast.right && statementify(convert(ast.right))
      };

    case 'TernaryExpression':
      return {
        type: 'ConditionalExpression',
        test: convert(ast.condition),
        consequent: convert(ast.left),
        alternate: convert(ast.right)
      };

    case 'MultiplicationExpression':
      return {
        type: 'BinaryExpression',
        operator: '*',
        left: convert(ast.left),
        right: convert(ast.right)
      };

    case 'AdditionExpression':
      return {
        type: 'BinaryExpression',
        operator: '+',
        left: convert(ast.left),
        right: convert(ast.right)
      };

    case 'SubtractionExpression':
      return {
        type: 'BinaryExpression',
        operator: '-',
        left: convert(ast.left),
        right: convert(ast.right)
      };

    case 'DivisionExpression':
      return {
        type: 'BinaryExpression',
        operator: '/',
        left: convert(ast.left),
        right: convert(ast.right)
      };

    case 'PowerExpression':
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
          convert(ast.left),
          convert(ast.right)
        ]
      };

    case 'ModExpression':
      return {
        type: 'BinaryExpression',
        operator: '%',
        left: convert(ast.left),
        right: convert(ast.right)
      };

    case 'BlockStatement':
      return {
        type: 'BlockStatement',
        body: ast.body.map(convert).map(statementify)
      }

    case 'TrueExpression':
      return {
        type: 'Literal',
        value: true,
        raw: 'true'
      };

    case 'FalseExpression':
      return {
        type: 'Literal',
        value: false,
        raw: 'false'
      };

    case 'StringLiteral':
      return {
        type: 'Literal',
        value: ast.value.replace('\r', '\\r')
                        .replace('\n', '\\n')
                        .replace('\t', '\\t')
                        ,
        raw: ast.value
      };

    case 'IntegerLiteral':
      return {
        type: 'Literal',
        value: ast.value,
        raw: ast.value.toString()
      };

    case 'FloatLiteral':
      return {
        type: 'Literal',
        value: ast.value,
        raw: ast.value.toString()
      };

    case 'FunctionStatement':
      return {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: ast.name
        },
        params: ast.args.map(function(pair) {
          return {
            type: 'Identifier',
            name: pair[0]
          }
        }),
        body: {
          type: 'BlockStatement',
          body: ast.body.map(convert).map(statementify)
        },
      };

    case 'Identifier':
      return {
        type: 'Identifier',
        name: ast.name
      };

    case 'ReturnStatement':
      return {
        type: 'ReturnStatement',
        argument: convert(ast.expression)
      };

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
    jsast.body.push(statementify(convert(ast)));
  });

  // console.log(JSON.stringify(jsast, null, 2));

  return escodegen.generate(jsast, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};
