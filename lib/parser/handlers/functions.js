var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['function'] = {
  nud: function(content, loc) {
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
    var returnType = types.make('void');

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

    if (this.peek(':')) {
      returnType = this.typeRef();
    }

    var body = this.block();
    var node = new syntax.FunctionStatement(name, args, returnType, body);
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

/* istanbul ignore next */
exports['method'] = {
  nud: function(content, loc) {
    var base = exports['function'].nud.call(this, content, loc);

    if (base.args.length < 0) {
      this._updateLines(this.prev);
      throw new Error('Method definitions require at least one argument');
    }

    var node = new syntax.MethodStatement(base.name, base.args, base.type, base.body);
    node.loc = base.loc;

    return node;
  }
};

/* istanbul ignore next */
exports['lambda'] = {
  nud: function(content, loc) {
    var args = [];

    if (this.peek('(')) {
      do {
        args.push(this.expression(0));
      } while (this.peek(','));
      this.expect(')');
    }
    var body = this.block();

    var node = new syntax.LambdaExpression(args, body);
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

/* istanbul ignore next */
exports['return'] = {
  nud: function(content, loc) {
    var exp = this.peek('void') ? null : this.expression();
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
