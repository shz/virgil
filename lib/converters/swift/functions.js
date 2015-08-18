var ast = require('../../ast');

exports.func = function(node) {
  var returnType = node.returnType.name == 'void' ? '' : (' -> ' + this.type(node.returnType));
  var params = this.params(node.args);

  if (node instanceof ast.LambdaExpression) {
    var body = null;
    if (node.body.body.length > 1) {
      body = '\n' + this.indent('\n' + node.body.body.map(this.convert, this).join('\n')) + '\n';
    } else {
      body = ' ' + this.convert(node.body.body[0]) + ' ';
    }

    return '{(' + params + ') -> ' + returnType + ' in' + body + '}';
  } else {
    if (node instanceof ast.MethodStatement) {
      this.renameIdentifier(node.args[0][0], 'self');
      // Redo params to exclude the now-renamed self param
      params = this.params(node.args.slice(1));
    }
    var body = this.convert(node.body);
    if (node instanceof ast.MethodStatement) {
      this.renameIdentifier(node.args[0][0], false);
    }

    return 'func ' + node.name + '(' + params + ')' + returnType + ' ' + body;
  }
};

exports.params = function(args) {
  return args.map(function(arg) {
    if (arg[1].isGeneric) {
      throw new Error('Cannot use generics with swift yet');
    }

    return arg[0] + ': ' + this.type(arg[1]);
  }, this).join(', ');
};

