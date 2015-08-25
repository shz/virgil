var ast = require('../../ast');

exports.statement = function(node) {
  switch (node.constructor) {
    case ast.Module:
      return this.convertUnnaturals(node._unnaturalMethods);

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
      str += this.convertUnnaturals(node._unnaturalMethods);
      str += this.indent(node.body.map(this.convert, this).join('\n'));
      str += '\n}';
      return str;

    case ast.FunctionStatement:
      return this.func(node);

    case ast.ReturnStatement:
      return 'return ' + this.convert(node.expression);
    case ast.AssignmentStatement:
      return this.convert(node.left) + ' = ' + this.convert(node.right);

    case ast.OutVariableDeclaration:
    case ast.VariableDeclaration:
      // In Swift, let/var also affects *properties* on variables.  Since
      // this restriction isn't present in Virgil, we need to declare some
      // types `var` regardless of their original declaration in Virgil.
      if (!node.type.builtin && node.type.name != 'list' & node.type.name != 'datetime') {
        return 'let ' + node.name + ' = ' + this.convert(node.expression);
      }
      // else fall through
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
      return ''; // These are dealt with via method sweeps already
    case ast.StructStatement:
      // Build the members
      var body = this.convert(node.body);

      // Build the constructor
      body = body.replace(/}$/, '\n');
      body += this.indent('init(' + this.params(node.body.declarations.map(function(decl) {
        return [decl.name, decl.type]
      })) + ') {\n' + this.indent(node.body.declarations.map(function(decl) {
        return 'self.' + decl.name + ' = ' + decl.name;
      }).join('\n')) + '\n}');
      body += '\n}';

      // Add methods if they're defined
      if (node._naturalMethods) {
        body = body.replace(/}$/, '\n');
        body += Object.keys(node._naturalMethods).map(function(key) {
          return this.indent(this.func(node._naturalMethods[key]));
        }, this).join('\n');
        body += '\n}';
      }

      // Generics section
      var generics = '';
      if (node.generics.length) {
        generics = '<' + node.generics.map(function(name) {
          return name.substr(1);
        }).join(', ') + '>';
      }

      return 'class ' + node.name + generics + ' ' + body;

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
