var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
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
      this._updateLines(this.prev);
      throw new Error('This function has an empty argument list, which is not valid.  Try removing the parens');
    }

    do {
      var argName = this.expect('identifier')[1];
      var argType = types.canned['inferred'];
      if (hasArg(argName)) {
        throw new Error('There is already an argument named ' + name);
      }
      if (this.peek(':')) {
        argType = this.typeRef();
      } else if (doRequireArgTypes) {
        this._updateLines(this.prev);
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
  nud: function(content, loc) {

    var name = this.expect('identifier')[1];
    if (name[0].toUpperCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Function names must be lowerCamelCased');
    }

    var signature = collectSignature.call(this, true);

    var body = this.block();
    var node = new syntax.FunctionStatement(name, signature.args, signature.returnType, body);
    body.owner = node;
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: body.loc.end
    };

    return node;
  }
};

exports['method'] = {
  nud: function(content, loc) {
    var base = exports['function'].nud.call(this, content, loc);

    if (base.args.length < 0) {
      this._updateLines(this.prev);
      throw new Error('Method definitions require at least one argument');
    }

    var node = new syntax.MethodStatement(base.name, base.args, base.returnType, base.body);
    node.loc = base.loc;

    return node;
  }
};

exports['lambda'] = {
  nud: function(content, loc) {

    var signature = collectSignature.call(this, false);

    var body = this.block();
    var node = new syntax.LambdaExpression(signature.args, body, signature.returnType);
    body.owner = node;
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: body.loc.end
    };

    return node;
  }
};

exports['return'] = {
  nud: function(content, loc) {
    var exp = null;

    // Do a manual, whitespace disallowed peek
    while (this.cur[0] == 'whitespace')
      this.next();
    if (this.cur[0] == 'void') {
      this.next();
    } else if (this.cur[0] != 'newline') {
      exp = this.expression();
    }
    var node = new syntax.ReturnStatement(exp);

    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: node.expression ? node.expression.end : {
        line: loc.line,
        col: loc.end
      }
    };

    return node;
  }
};
