var escodegen = require('escodegen')
  , syntax = require('../ast')
  ;

var statementify = function(node) {
  if (node.type.match(/Literal|Expression|Identifier/)) {
    return {
      type: 'ExpressionStatement',
      expression: node
    };
  } else {
    return node;
  }
};

var convert = function(node) {
  if (!node)
    return null;

  switch (node.constructor.name) {
    case 'IfStatement':
      return {
        type: 'IfStatement',
        test: convert(node.condition),
        consequent: statementify(convert(node.left)),
        alternate: node.right && statementify(convert(node.right))
      };

    case 'TernaryExpression':
      return {
        type: 'ConditionalExpression',
        test: convert(node.condition),
        consequent: convert(node.left),
        alternate: convert(node.right)
      };

    case 'MultiplicationExpression':
      return {
        type: 'BinaryExpression',
        operator: '*',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'AdditionExpression':
      return {
        type: 'BinaryExpression',
        operator: '+',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'SubtractionExpression':
      return {
        type: 'BinaryExpression',
        operator: '-',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'DivisionExpression':
      return {
        type: 'BinaryExpression',
        operator: '/',
        left: convert(node.left),
        right: convert(node.right)
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
          convert(node.left),
          convert(node.right)
        ]
      };

    case 'ModExpression':
      return {
        type: 'BinaryExpression',
        operator: '%',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'BlockStatement':
      return {
        type: 'BlockStatement',
        body: node.body.map(convert).map(statementify)
      }

    case 'TrueLiteral':
      return {
        type: 'Literal',
        value: true,
        raw: 'true'
      };

    case 'FalseLiteral':
      return {
        type: 'Literal',
        value: false,
        raw: 'false'
      };

    case 'StringLiteral':
      return {
        type: 'Literal',
        value: node.value.replace(/\r/g, '\\r')
                        .replace(/\n/g, '\\n')
                        .replace(/\t/g, '\\t')
                        ,
        raw: node.value
      };

    case 'IntegerLiteral':
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };

    case 'FloatLiteral':
      return {
        type: 'Literal',
        value: node.value,
        raw: node.value.toString()
      };

    case 'FunctionStatement':
      return {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: node.name
        },
        params: node.args.map(function(pair) {
          return {
            type: 'Identifier',
            name: pair[0]
          }
        }),
        body: convert(node.body)
      };

    case 'Identifier':
      return {
        type: 'Identifier',
        name: node.name
      };

    case 'ReturnStatement':
      return {
        type: 'ReturnStatement',
        argument: convert(node.expression)
      };

    case 'AssignmentStatement':
      return {
        type: 'AssignmentExpression',
        operator: '=',
        left: convert(node.left),
        right: convert(node.right)
      };

    case 'VariableDeclaration':
    case 'OutVariableDeclaration':
    case 'MutableVariableDeclaration':
      return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: node.name
          },
          init: convert(node.expression)
        }]
      };

    case 'AssignmentBlock':
      return {
        type: 'ObjectExpression',
        properties: node.declarations.map(function(d) {
          return {
            type: 'Property',
            kind: 'init',
            key: { type: 'Identifier', name: d.name },
            value: convert(d.expression)
          };
        })
      };

    case 'FunctionCallExpression':
      if (node.left.constructor == syntax.Identifier && node.left.name[0].toUpperCase() == node.left.name[0]) {
        if (node.args.length > 1)
          throw new Error('Cannot pass multiple arguments to a constructor');
        if (node.args.length == 1 && node.args[0].constructor != syntax.AssignmentBlock)
          throw new Error('Only assignment blocks can be passed to a constructor');

        return {
          type: 'NewExpression',
          callee: convert(node.left),
          arguments: node.args.map(convert)
        }
      }
      return {
        type: 'CallExpression',
        callee: convert(node.left),
        arguments: node.args.map(convert)
      };

    case 'StructStatement':
      return {
        type: 'FunctionDeclaration',
        id: {
          type: 'Identifier',
          name: node.name
        },
        params: [{type: 'Identifier', name: 'params'}],
        body: {
          type: 'BlockStatement',
          body: node.body.declarations.map(function(d) {
            return {
              type: 'AssignmentExpression',
              operator: '=',
              left: {
                type: 'MemberExpression',
                computed: false,
                object: { type: 'ThisExpression' },
                property: { type: 'Identifier', name: d.name }
              },
              right: convert(d.expression)
            };
          }).map(statementify).concat([{
            type: 'ForInStatement',
            each: false,
            left: {
              type: 'VariableDeclaration',
              declarations: [{
                type: 'VariableDeclarator',
                id: { type: 'Identifier', name: 'i' },
                init: null
              }],
              kind: 'var'
            },
            right: { type: 'Identifier', name: 'params' },
            body: {
              type: 'IfStatement',
              test: {
                type: 'CallExpression',
                callee: {
                  type: 'MemberExpression',
                  computed: false,
                  object: { type: 'Identifier', name: 'params' },
                  property: { type: 'Identifier', name: 'hasOwnProperty' }
                },
                arguments: [{ type: 'Identifier', name: 'i' }]
              },
              consequent: {
                type: 'ExpressionStatement',
                expression: {
                  type: 'AssignmentExpression',
                  operator: '=',
                  left: {
                    type: 'MemberExpression',
                    computed: true,
                    object: { type: 'ThisExpression' },
                    property: { type: 'Identifier', name: 'i' }
                  },
                  right: {
                    type: 'MemberExpression',
                    computed: true,
                    object: { type: 'Identifier', name: 'params' },
                    property: { type: 'Identifier', name: 'i' }
                  }
                }
              },
              alternate: null
            }
          }])
        }
      };

    case 'PropertyAccessExpression':
      return {
        type: 'MemberExpression',
        computed: node.computed,
        object: convert(node.left),
        property: convert(node.right)
      };

    case 'ListExpression':
      return {
        type: 'ArrayExpression',
        elements: node.body.map(convert)
      };

    case 'WhileStatement':
      return {
        type: 'WhileStatement',
        test: convert(node.expression),
        body: convert(node.body)
      };

    case 'TryCatchStatement':
      return {
        type: 'TryStatement',
        block: convert(node.left),
        handlers: [{
          type: 'CatchClause',
          param: {
            type: 'Identifier',
            name: 'err'
          },
          body: convert(node.right)
        }],
        finalizer: null
      };

    case 'ForStatement':
      return {
        type: 'ForStatement',
        init: convert(node.declaration),
        test: {
          type: 'BinaryExpression',
          operator: '<',
          left: { type: 'Identifier', name: node.declaration.name },
          right: convert(node.end)
        },
        update: {
          type: 'UpdateExpression',
          operator: node.up ? '++' : '--',
          argument: { type: 'Identifier', name: node.declaration.name },
          prefix: false
        },
        body: convert(node.body)
      };

    case 'BreakStatement':
      return {
        type: 'BreakStatement',
        lable: null
      };

    case 'ContinueStatement':
      return {
        type: 'ContinueStatement',
        lable: null
      };

    default:
      throw new Error('Don\'t know how to convert ' + node.constructor.name);
  }
};

module.exports = function(node) {
  var jsnode = {
    type: 'Program',
    body: []
  };

  node.forEach(function(node) {
    jsnode.body.push(statementify(convert(node)));
  });

  // console.log(JSON.stringify(jsnode, null, 2));

  return escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};
