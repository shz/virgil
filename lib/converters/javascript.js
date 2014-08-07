// Ignoring this file for istanbul, as it's covered by the
// integration tests.

var escodegen = require('escodegen')
  , syntax = require('../ast')
  , types = require('../types')
  ;

/* istanbul ignore next */
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

/* istanbul ignore next */
var binaryExpression = function(type, node) {
  return {
    type: 'BinaryExpression',
    operator: type,
    left: convert(node.left),
    right: convert(node.right)
    };
};

/* istanbul ignore next */
var makeFunction = function(node, makeMethod) {
  var name = node.name;
  var args = node.args;
  var body = convert(node.body)

  // If we're in method mode, turn the first arg into `this`
  if (makeMethod) {
    body.body.unshift({
      type: 'VariableDeclaration',
      kind: 'var',
      declarations: [{
        type: 'VariableDeclarator',
        id: { type: 'Identifier', name: args[0][0] },
        init: { type: 'ThisExpression' }
      }]
    });
    args = args.slice(1);
  }

  return {
    type: makeMethod ? 'FunctionExpression' : 'FunctionDeclaration',
    id: {
      type: 'Identifier',
      name: name
    },
    params: args.map(function(pair) {
      return {
        type: 'Identifier',
        name: pair[0]
      }
    }),
    body: body
  };
};

/* istanbul ignore next */
var convert = function(node, isRootScope) {
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

    case 'EqualsExpression':
      return binaryExpression('==', node);

    case 'LogicalOrExpression':
      return binaryExpression('||', node);

    case 'MultiplicationExpression':
      return binaryExpression('*', node);

    case 'AdditionExpression':
      return binaryExpression('+', node);

    case 'SubtractionExpression':
      return binaryExpression('-', node);

    case 'DivisionExpression':
      return binaryExpression('/', node);

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
      return binaryExpression('%', node);

    case 'GreaterThanExpression':
      return binaryExpression('>', node);

    case 'LessThanExpression':
      return binaryExpression('<', node);



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

    case 'NullLiteral':
      return {
        type: 'Literal',
        value: null,
        raw: 'null'
      }

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
      return makeFunction(node);

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
      // Handle constructors
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

      // Handle methods based on heuristics
      if (node.left.constructor == syntax.PropertyAccessExpression) {
        var methodScope = node.scope.search('method', node.left.right.name);
        if (methodScope) {
          var type = types.calculate(node.left.left).name;

          console.log(type, methodScope.structs);

          // Figure out if a "regular" method call won't fit the bill
          if (!methodScope.structs.hasOwnProperty(type)) {
            return {
              type: 'CallExpression',
              callee: convert(node.left.right),
              arguments: [node.left.left].concat(node.args).map(convert)
            };
          }
        }

        // return {
        //   type: 'CallExpression',
        //   callee: convert(node.left.left),
        //   arguments: node.args.map(convert)
        // };
      }

      // Otherwise, it's a regular old function call
      return {
        type: 'CallExpression',
        callee: convert(node.left),
        arguments: node.args.map(convert)
      };

    case 'MethodStatement':
      var baseName = node.args[0][1].name;
      var structDef = node.scope.structs[baseName];

      // If the type is defined in the same scope as us and the
      // export definitions match up, define it as a native JS method.
      if (structDef && (!structDef.ex || node.ex)) {
        // HACK
        node.ex = false;
        // END HACK
        return {
          type: 'AssignmentExpression',
          operator: '=',
          left: {
            type: 'MemberExpression',
            computed: false,
            property: { type: 'Identifier', name: node.name },
            object: {
              type: 'MemberExpression',
              computed: false,
              property: { type: 'Identifier', name: 'prototype' },
              object: { type: 'Identifier', name: baseName}
            }
          },
          right: makeFunction(node, true)
        };

      // Otherwise just make it a function
      } else {
        return makeFunction(node);
      }

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
    case 'ListAccessExpression':
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

    case 'LambdaExpression':
      return {
        type: 'FunctionExpression',
        id: null,
        params: node.args.map(function(id) {
          return { type: 'Identifier', name: id.name }
        }),
        body: convert(node.body)
      };

    default:
      throw new Error('Don\'t know how to convert ' + node.constructor.name);
  }
};

/* istanbul ignore next */
var makeNodeModule = function(exp) {
  return [{
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'module' },
        property: { type: 'Identifier', name: 'exports' }
      },
      right: exp
    }
  }];
};

/* istanbul ignore next */
var makeBrowserModule = function(name, exp) {
  var parts = name.split('.');

  var body = [];
  var cur = { type: 'Identifier', name: 'window' };
  parts.forEach(function(p) {
    cur = {
      type: 'MemberExpression',
      computed: false,
      object: cur,
      property: { type: 'Identifier', name: p }
    };

    if (p == parts[parts.length -1 ])
      return;

    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: cur,
        right: {
          type: 'LogicalExpression',
          operator: '||',
          left: cur,
          right: {
            type: 'ObjectExpression',
            properties: []
          }
        }
      }
    });
  });

  body.push(statementify({
    type: 'AssignmentExpression',
    operator: '=',
    left: cur,
    right: exp
  }));

  return body;
};

/* istanbul ignore next */
module.exports = function(node, options) {
  // Base JS program
  var jsnode = {
    type: 'Program',
    body: []
  };

  // Convert to the equivalent Javascript AST
  if (node instanceof Array) {
    node.forEach(function(node) {
      jsnode.body.push(statementify(convert(node, true)));
    });
  } else if (node instanceof syntax.Module) {
    // Find exports
    var exports = [];
    node.body.forEach(function(n) {
      if (n.ex) {
        exports.push({
          type: 'Property',
          key: { type: 'Identifier', name: n.name },
          value: { type: 'Identifier', name: n.name }
        });
      }
    });

    // Build the main body
    var body = {
      type: 'CallExpression',
      arguments: [],
      callee: {
        type: 'FunctionExpression',
        id: null,
        params: [],
        body: {
          type: 'BlockStatement',
          body: node.body.map(convert, true).map(statementify).concat([{
            type: 'ReturnStatement',
            argument: {
              type: 'ObjectExpression',
              properties: exports
            }
          }])
        }
      }
    };

    // Package it up depending on node/browser env
    jsnode.body = options.node ? makeNodeModule(body)
                               : makeBrowserModule(options.moduleName || 'virgil', body)
                               ;
  } else {
    throw new Error('Don\'t know how to convert a ' + node.constructor.name + ' to Javascript');
  }

  // console.log(JSON.stringify(jsnode, null, 2));

  // Turn Javascript AST to a string
  return escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};
