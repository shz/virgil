var syntax = require('../ast')
  , types = require('../types')
  , handlers = require('./handlers')
  ;

// These are parsing utilities that grab different components.  Blocks,
// typerefs, etc.

exports.expression = function(rbp) {
  var tree = this.statement(rbp || 0);

  if (!(tree instanceof syntax.Expression))
    throw new Error('Expected expression, got ' + tree.constructor.name);

  return tree;
};

exports.block = function(rbp) {
  var statements = [];

  this.expect('{');
  while (!this.peek('}'))
    statements.push(this.statement(0));

  return statements;
};

exports.assignmentBlock = function(allowStructs) {
  var structs = {};
  var declarations = [];
  this.expect('{');
  while (!this.peek('}')) {
    if (allowStructs && this.peek('struct')) {
      var st = handlers['struct'].nud.call(this);
      structs[st.name] = st;
    } else {
      declarations.push(handlers['let'].nud.call(this));
    }
  }

  return new syntax.AssignmentBlock(declarations, structs);
};

exports.typeRef = function() {
  var base = this.expect('identifier')[1];
  var generics = [];

  if (this.peek('<')) {
    do {
      generics.push(this.typeRef());
    } while (this.peek(':'));

    this.expect('>');
  }

  return new types.TypeRef(base, generics);
};
