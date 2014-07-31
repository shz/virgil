var syntax = require('../../ast')
  , types = require('../../types')
  ;

exports['function'] = {
  nud: function() {
    var hasArg = function(name) {
      for (var i=0; i<args.length; i++)
        if (args[i][0] == name)
          return true;

      return false;
    };

    var name = this.expect('identifier')[1];
    var args = [];
    var returnType = new types.TypeRef('void');

    if (this.peek('lparen')) {

      if (this.peek('rparen'))
        throw new Error('This function has an empty argument list, which is not valid.  Try removing the parens');

      do {
        var arg = this.typeRef();
        var name = this.expect('identifier')[1];

        if (hasArg(name))
          throw new Error('There is already an argument named ' + name);

        args.push([name, arg]);

      } while (this.peek('comma'));

      this.expect('rparen');
    }

    if (this.peek('returns')) {
      returnType = this.typeRef();
    }

    var body = this.block();

    return new syntax.FunctionStatement(name, args, returnType, body);
  }
};

exports['return'] = {
  nud: function() {
    return new syntax.ReturnStatement(this.expression(0));
  }
};
