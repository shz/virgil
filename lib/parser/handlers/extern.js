var ast = require('../../ast')
  , types = require('../../types')
  ;

var parseFunctionDecl = function(loc) {
  var hasArg = function(name) {
    for (var i=0; i<args.length; i++)
      if (args[i][0] == name)
        return true;

    return false;
  };

  var name = this.expect('identifier');
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

  var node = new ast.FunctionStatement(name[1], args, returnType, null, false);
  node.loc = {
    start: {
      line: loc.line,
      col: loc.start
    },
    end: {
      line: loc.line,
      col: loc.end
    }
  };
  return node;
};

var parseMethodDecl = function(loc) {
  var base = parseFunctionDecl.call(this, loc);

  if (base.args.length < 0) {
      this._updateLines(this.prev);
      throw new Error('Method definitions require at least one argument');
    }

  var node = new ast.MethodStatement(base.name, base.args, base.type, base.body);
  node.nat = true;
  node.loc = base.loc;

  return node;
};

var parseGlobalDecl = function(loc) {
  var name = this.expect('identifier');
  this.expect(':');
  var type = this.typeRef();

  var node = new ast.VariableDeclaration(name[1], type, new ast.NullLiteral(), false);
  node.loc = {
    start: {
      line: loc.line,
      col: loc.start
    },
    end: {
      line: this.line,
      col: this.colEnd
    }
  };
  return node;
};

var parseStructDelc = function(loc) {
  var name = this.expect('identifier')[1];
  if (name[0].toLowerCase() == name[0]) {
    this._updateLines(this.prev);
    throw new Error('Struct names must be UpperCamelCased');
  }
  var declarations = [];

  this.expect('{');
  while (!this.peek('}')) {
    var declName = this.expect('identifier');
    this.expect(':');
    var type = this.typeRef();

    var decl = new ast.VariableDeclaration(declName[1], type, new ast.NullLiteral(), false);
    decl.loc = {
      start: {
        line: declName[2].line,
        col: declName[2].start
      },
      end: {
        line: this.line,
        col: this.colEnd
      }
    };
    declarations.push(decl);

    // Eat up separators
    while (this.peek('newline') || this.peek(';'))
      ;
  }

  var node = new ast.StructStatement(name, new ast.AssignmentBlock(declarations));
  node.loc = {
    start: {
      line: loc.line,
      col: loc.start
    },
    end: {
      line: this.line,
      col: this.colEnd
    }
  };

  return node;
};

exports['extern'] = {
  nud: function(value, loc) {
    this.expect('{');

    var structs = [];
    var methods = [];
    var functions = [];
    var declarations = [];

    while (!this.peek('}')) {
      if (this.peek('identifier', true)) {
        declarations.push(parseGlobalDecl.call(this, loc));
      } else if (this.peek('struct')) {
        structs.push(parseStructDelc.call(this, loc));
      } else if (this.peek('method')) {
        methods.push(parseMethodDecl.call(this, loc));
      } else if (this.peek('function')) {
        functions.push(parseFunctionDecl.call(this, loc));
      } else {
        throw new Error('Unexpected token ' + this.next());
      }
    }

    var node = new ast.ExternStatement(structs, functions, methods, declarations);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      }
    };

    return node;
  }
}
