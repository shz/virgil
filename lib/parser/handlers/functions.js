var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['function'] = {
  nud: function() {
    var hasArg = function(name) {
      for (var i=0; i<args.length; i++)
        if (args[i][0] == name)
          return true;

      return false;
    };

    var name = this.expect('identifier')[1];
    if (name[0].toUpperCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Function names must be lowerCamelCased');
    }

    var args = [];
    var returnType = new types.TypeRef('void');

    if (this.peek('(')) {

      if (this.peek(')')) {
        this._updateLines(this.prev);
        throw new Error('This function has an empty argument list, which is not valid.  Try removing the parens');
      }

      do {
        var argName = this.expect('identifier')[1];
        this.expect(':');
        var arg = this.typeRef();

        if (hasArg(argName))
          throw new Error('There is already an argument named ' + name);

        args.push([argName, arg]);

      } while (this.peek(','));

      this.expect(')');
    }

    if (this.peek('returns')) {
      returnType = this.typeRef();
    }

    var body = this.block();

    return new syntax.FunctionStatement(name, args, returnType, body);
  }
};

/* istanbul ignore next */
exports['method'] = {
  nud: function() {
    var base = exports['function'].call(this);

    if (base.args.length < 0)
      throw new Error('Method definitions require at least one argument');
  }
};

/* istanbul ignore next */
exports['lambda'] = {
  nud: function() {
    var args = [];

    if (this.peek('(')) {
      do {
        args.push(this.expression(0));
      } while (this.peek(','));
      this.expect(')');
    }
    var body = this.block();

    return new syntax.LambdaExpression(args, body);
  }
};

/* istanbul ignore next */
exports['return'] = {
  nud: function() {
    return new syntax.ReturnStatement(this.expression(0));
  }
};
