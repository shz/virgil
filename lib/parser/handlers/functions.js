var ast = require('../../ast')
  , types = require('../../types')
  ;

var collectSignature = function(doRequireArgTypes) {

  var hasArg = function(name) {
    for (var i=0; i<args.length; i++)
      if (args[i][0] == name)
        return true;

    return false;
  };

  var args = [];
  var retTypeRef = types.make('void');

  if (this.peek('(')) {

    if (this.peek(')')) {
      throw new Error('This function has an empty argument list, which is not valid.  Try removing the parens');
    }

    do {
      var argName = this.expect('identifier').value;
      var argType = types.canned['inferred'];
      if (hasArg(argName)) {
        throw new Error('There is already an argument named ' + name);
      }
      if (this.peek(':')) {
        argType = this.typeRef();
      } else if (doRequireArgTypes) {
        throw new Error('Type is required for argument named ' + name);
      }
      args.push([argName, argType]);

    } while (this.peek(','));

    this.expect(')');
  }

  if (this.peek(':')) {
    retTypeRef = this.typeRef();
  }

  return {
    args: args,
    returnType: retTypeRef
  };
}


exports['function'] = {
  nud: function(t) {

    var name = this.expect('identifier').value;
    if (name[0].toUpperCase() == name[0]) {
      throw new Error('Function names must be lowerCamelCased');
    }

    var signature = collectSignature.call(this, true);

    var body = this.block();
    var node = new ast.FunctionStatement(name, signature.args, signature.returnType, body);
    body.owner = node;
    return node;
  }
};

exports['method'] = {
  nud: function(t) {
    var base = exports['function'].nud.call(this, t);

    if (base.args.length < 0) {
      throw new Error('Method definitions require at least one argument');
    }

    var node = new ast.MethodStatement(base.name, base.args, base.returnType, base.body);
    node.loc = base.loc;

    return node;
  }
};

exports['lambda'] = {
  nud: function(t) {
    var signature = collectSignature.call(this, false);

    var body = this.block();
    var node = new ast.LambdaExpression(signature.args, body, signature.returnType);
    body.owner = node;
    return node;
  }
};

exports['return'] = {
  nud: function(t) {
    var exp = null;

    // Do a manual, whitespace disallowed peek
    while (this.cur.name == 'whitespace')
      this.next();
    if (this.cur.name == 'void') {
      this.next();
    } else if (this.cur.name != 'newline') {
      exp = this.expression();
    }
    return new ast.ReturnStatement(exp);
  }
};
