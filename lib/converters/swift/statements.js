var ast = require('../../ast');

exports.statement = function(node) {
  switch (node.constructor) {
    case ast.ImportStatement:
      return ''; // Swift doesn't have imports (!)

    case ast.ExternStatement:
      return ''; // Ignore me!

    case ast.IfStatement:
      var str = 'if ' + this.convert(node.condition) + ' ' + this.convert(node.left);
      if (node.right) {
        str += ' else ' + this.convert(node.right);
      }
      return str;

    case ast.BlockStatement:
      var str = '{\n';
      str += this.indent(node.body.map(this.convert, this).join('\n'));
      str += '\n}';
      return str;

    case ast.FunctionStatement:
      var returnType = this.type(node.returnType);
      var params = node.args.map(function(arg) {
        return arg[0] + ': ' + this.type(arg[1]);
      }, this).join(', ');
      var body = this.convert(node.body);
      return 'func ' + node.name + '(' + params + ') -> ' + returnType + ' ' + body;

    case ast.ReturnStatement:
      return 'return ' + this.convert(node.expression);
    case ast.AssignmentStatement:
      return 'TODO - ASSIGNMENT';

    case ast.OutVariableDeclaration:
    case ast.VariableDeclaration:
      return 'let ' + node.name + ' = ' + this.convert(node.expression);
    case ast.MutableVariableDeclaration:
      return 'var ' + node.name + ' = ' + this.convert(node.expression);
    case ast.AssignmentBlock:
      node.error('Is this even possible?');
    case ast.MethodStatement:
      return 'TODO - METHOD';
    case ast.StructStatement:
      return 'TODO - STRUCT';
    case ast.WhileStatement:
      return 'while ' + this.convert(node.expression) + this.convert(node.body);
    case ast.TryCatchStatement:
      return 'TODO - TRY/CATCH';
    case ast.ForStatement:
      return 'TODO - FOR';
    case ast.ContinueStatement:
      return 'continue';
    case ast.BreakStatement:
      return 'break';

    default:
      node.throw('Don\'t know how to convert ' + node.constructor.name);
  }
};
