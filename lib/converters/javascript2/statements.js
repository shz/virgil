var ast = require('../../ast');

exports.statement = function(node) {
  switch (node.constructor) {

    case ImportStatement:
      return this.getDeclarationForImport(node);

    case ExternStatement:
      break;

    case ast.IfStatement:
      return {
        type: 'IfStatement',
        test: this.convert(node.condition),
        consequent: this.statementify(this.convert(node.left)),
        alternate: node.right && this.statementify(this.convert(node.right))
      };

    case ast.BlockStatement:
      return {
        type: 'BlockStatement',
        body: node.body.map(this.convert, this).map(this.statementify, this)
      };

    case ast.FunctionStatement:
      return this.makeFunction(node);

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

    case ast.ReturnStatement:
      return {
        type: 'ReturnStatement',
        argument: this.convert(node.expression)
      };

    case ast.AssignmentStatement:
      return {
        type: 'AssignmentExpression',
        operator: '=',
        left: this.convert(node.left),
        right: this.convert(node.right)
      };

    case ast.VariableDeclaration:
    case ast.OutVariableDeclaration:
    case ast.MutableVariableDeclaration:
      var name = node.name;
      if (node.jsShadowCount) {
        name += '$' + node.jsShadowCount;
      }
      return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: name
          },
          init: this.convert(node.expression)
        }]
      };

    case ast.AssignmentBlock:
      return {
        type: 'ObjectExpression',
        properties: node.declarations.map(function(d) {
          return {
            type: 'Property',
            kind: 'init',
            key: { type: 'Identifier', name: d.name },
            value: this.convert(d.expression)
          };
        }, this)
      };

    case ast.MethodStatement:
      var baseName = node.args[0][1].name;

      if (node.nat) {
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
          right: this.makeFunction(node, true)
        };

      // Otherwise just make it a function
      } else {
        return this.makeFunction(node);
      }

    case ast.StructStatement:
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
              right: this.convert(d.expression)
            };
          }, this).map(statementify, this).concat([{
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

    case ast.WhileStatement:
      return {
        type: 'WhileStatement',
        test: this.convert(node.expression),
        body: this.convert(node.body)
      };

    case ast.TryCatchStatement:
      return {
        type: 'TryStatement',
        block: this.convert(node.left),
        handlers: [{
          type: 'CatchClause',
          param: {
            type: 'Identifier',
            name: 'err'
          },
          body: this.convert(node.right)
        }],
        finalizer: null
      };

    case ast.ForStatement:
      return {
        type: 'ForStatement',
        init: this.convert(node.declaration),
        test: {
          type: 'BinaryExpression',
          operator: node.up ? '<' : '>',
          left: { type: 'Identifier', name: node.declaration.name },
          right: this.convert(node.end)
        },
        update: {
          type: 'UpdateExpression',
          operator: node.up ? '++' : '--',
          argument: { type: 'Identifier', name: node.declaration.name },
          prefix: false
        },
        body: this.convert(node.body)
      };

    case ast.BreakStatement:
      return {
        type: 'BreakStatement',
        lable: null
      };

    case ast.ContinueStatement:
      return {
        type: 'ContinueStatement',
        lable: null
      };

    default:
      node.throw('Don\'t know how to convert ' + node.constructor);
  }
};
