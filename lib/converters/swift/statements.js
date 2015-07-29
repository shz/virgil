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
      var returnType = node.returnType.name == 'void' ? ''
                     : (' -> ' + this.type(node.returnType))
                     ;
      var params = node.args.map(function(arg) {
        return arg[0] + ': ' + this.type(arg[1]);
      }, this).join(', ');
      var body = this.convert(node.body);
      return 'func ' + node.name + '(' + params + ')' + returnType + ' ' + body;

    case ast.ReturnStatement:
      return 'return ' + this.convert(node.expression);
    case ast.AssignmentStatement:
      return this.convert(node.left) + ' = ' + this.convert(node.right);

    case ast.OutVariableDeclaration:
    case ast.VariableDeclaration:
      return 'let ' + node.name + ' = ' + this.convert(node.expression);
    case ast.MutableVariableDeclaration:
      return 'var ' + node.name + ' = ' + this.convert(node.expression);
    case ast.AssignmentBlock:
      var str = '{\n';
      str += this.indent(node.declarations.map(function(d) {
        return 'var ' + d.name + ': ' + this.type(d.type) + ' = ' + this.convert(d.expression);
      }, this).join('\n'));
      str += '\n}';
      return str;

    case ast.MethodStatement:
      return ''; // These are dealt with
    case ast.StructStatement:
      return 'class ' + node.name + ' ' + this.convert(node.body);

    case ast.WhileStatement:
      return 'while ' + this.convert(node.expression) + this.convert(node.body);
    case ast.TryCatchStatement:
      return node.throw('Not supported in Swift output yet');
    case ast.ForStatement:
      return 'for var ' + node.declaration.name + ' = ' + this.convert(node.declaration.expression) + '; '
           + node.declaration.name + (node.up ? ' < ' : ' > ') + this.convert(node.end) + '; '
           + (node.up ? '++' : '--') + node.declaration.name + ' '
           + this.convert(node.body)
           ;
    case ast.ContinueStatement:
      return 'continue';
    case ast.BreakStatement:
      return 'break';

    default:
      node.throw('Don\'t know how to convert ' + node.constructor.name);
  }
};
