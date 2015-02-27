var syntax = require('../ast')
  , types = require('../types')
  , handlers = require('./handlers')
  ;

// These are parsing utilities that grab different components.  Blocks,
// typerefs, etc.

exports.expression = function(rbp) {
  var tree = this.statement(rbp || 0);

  if (!(tree instanceof syntax.Expression)) {
    throw new Error('Expected expression, got ' + tree.constructor.name);
  }

  return tree;
};

exports.block = function(owner, rbp) {
  if (typeof owner == 'number') {
    rbp = owner;
    owner = undefined;
  }
  var statements = [];

  var start = this.expect('{');
  while (!this.peek('}')) {
    if (!this.peek('newline'))
      if (!this.peek(';'))
        statements.push(this.statement(0));
  }

  var node = new syntax.BlockStatement(owner, statements);
  node.loc = { start: start.loc.start, end: this.prev.loc.end };
  return node;
};

exports.assignmentBlock = function(alreadyOpened) {
  var structs = {};
  var declarations = [];
  var firstName = null;

  if (!alreadyOpened)
    this.expect('{');

  while (!this.peek('}')) {
    var name = this.expect('identifier');
    if (!firstName)
      firstName = name;
    var type = types.canned['inferred'];
    if (this.peek(':'))
      type = this.typeRef();
    this.expect('=');
    var expression = this.expression();

    // Handle usage of default
    if (expression.constructor == syntax.DefaultLiteral) {
      if (type == types.canned['inferred']) {
        throw new Error('Must specify type when using default');
      }
      expression.type = type;
    }

    declarations.push({
      name: name.value,
      type: type,
      expression: expression,
      loc: {
        start: name.loc.start,
        end: expression.loc.end
      }
    });
  }

  var node = new syntax.AssignmentBlock(declarations, structs);
  if (declarations.length) {
    node.loc = {
      start: firstName.loc.start,
      end: declarations[declarations.length - 1].expression.loc.end
    }
  } else {
    node.loc = this.prev.loc;
  }
  return node;
};

exports.typeRef = function() {
  if (this.peek('void'))
    return types.make('void');

  var generics = [];
  var base = null;
  if (this.peek('gref', true))
    base = this.expect('gref');
  else if (this.peek('identifier', true))
    base = this.expect('identifier');
  else if (this.peek('method', true))
    base = this.expect('method');
  else
    throw new Error('Expected generic reference or type name, got ' + this.cur.name);

  if (this.peek('<')) {
    do {
      generics.push(this.typeRef());
    } while (this.peek(','));

    this.expect('>');
  }

  return types.make(base.value, generics);
};
