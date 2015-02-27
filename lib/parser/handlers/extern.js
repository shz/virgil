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
      throw new Error('This function has an empty argument list, which is not valid.  Try removing the parens');
    }

    do {
      var argName = this.expect('identifier').value;
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

  var node = new ast.FunctionStatement(name.value, args, returnType, null, false);
  node.loc = { start: loc.start, end: this.prev.loc.end };
  return node;
};

var parseMethodDecl = function(loc) {
  var base = parseFunctionDecl.call(this, loc);

  if (base.args.length < 0) {
      throw new Error('Method definitions require at least one argument');
    }

  var node = new ast.MethodStatement(base.name, base.args, base.returnType, base.body);
  node.nat = true;
  node.loc = base.loc;

  return node;
};

var parseGlobalDecl = function(loc) {
  var name = this.expect('identifier');
  this.expect(':');
  var type = this.typeRef();

  var node = new ast.VariableDeclaration(name.value, type, new ast.NullLiteral(), false);
  node.loc = { start: loc.start, end: name.loc.end };
  return node;
};

var parseStructDelc = function(loc) {
  var name = this.expect('identifier').value;
  if (name[0].toLowerCase() == name[0]) {
    throw new Error('Struct names must be UpperCamelCased');
  }
  var generics = [];
  if (this.peek('<')) {
    do {
      generics.push(this.expect('gref').value);
    } while(this.peek(','));
    this.expect('>');
  }

  var declarations = [];

  this.expect('{');
  while (!this.peek('}')) {
    var declName = this.expect('identifier');
    this.expect(':');
    var type = this.typeRef();

    var decl = new ast.VariableDeclaration(declName.value, type, new ast.DefaultLiteral(), false);
    decl.loc = { start: declName.loc.start, end: this.prev.loc.end };
    declarations.push(decl);

    // Eat up separators
    while (this.peek('newline') || this.peek(';'))
      ;
  }

  var node = new ast.StructStatement(name, new ast.AssignmentBlock(declarations), false, generics);
  node.loc = { start: loc.start, end: this.prev.loc.end };
  return node;
};

exports['extern'] = {
  nud: function(t) {
    var structs = [];
    var methods = [];
    var functions = [];
    var declarations = [];
    var namespace = null;

    // Parse the optional namespace
    if (this.peek('identifier', true))
      namespace = this.expect('identifier').value;

    this.expect('{');
    while (!this.peek('}')) {
      if (this.peek('identifier', true, true)) {
        declarations.push(parseGlobalDecl.call(this, this.cur.loc));
      } else if (this.peek('struct', false, true)) {
        structs.push(parseStructDelc.call(this, this.cur.loc));
      } else if (this.peek('method', false, true)) {
        methods.push(parseMethodDecl.call(this, this.cur.loc));
      } else if (this.peek('function', false, true)) {
        functions.push(parseFunctionDecl.call(this, this.cur.loc));
      } else {
        throw new Error('Unexpected token ' + JSON.stringify(this.next()));
      }
    }

    var node = new ast.ExternStatement(namespace, structs, functions, methods, declarations);

    // Set the extern flag/reference on each item
    var add = function(t) { t.extern = node };
    [declarations, structs, methods, functions].forEach(function(t) {
      t.forEach(add);
    });

    return node;
  }
}
