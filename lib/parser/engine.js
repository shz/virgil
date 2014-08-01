var tokenizer = require('./tokenizer')
  , handlers = require('./handlers')
  , syntax = require('../ast')
  , types = require('../types')
  ;

var Engine = function Engine(src) {
  this.src = src;
  this.tokens = [];
  this.cur = null;
  this.prev = null;
  this.line = 0;
  this.colStart = 0;
  this.colEnd = 0;
};

Engine.prototype = {
  constructor: Engine,

  _updateLines: function(t) {
    if (t[2]) {
      this.line = t[2].line;
      this.colStart = t[2].start;
      this.colEnd = t[2].end;
    }
  },
  _handler: function(t) {
    if (!handlers[t[0]])
      throw new Error('No handler for ' + t[0] + '.  You found a parser bug!');

    return handlers[t[0]];
  },

  lbp: function(t, left) {
    var h = this._handler(t);

    // if (typeof h.lbp != 'number') {
    //   throw new Error('Unexpected token "' + t[0] + '"');
    // }

    return h.lbp || 0;
  },
  nud: function(t) {
    var h = this._handler(t);

    if (!h.nud) {
      this._updateLines(this.prev);
      throw new Error('Unexpected token "' + t[0] + '"');
    }

    return h.nud.call(this, t[1]);
  },
  led: function(t, left) {
    var h = this._handler(t);
    if (!h.led)
      throw new Error('No led defined for ' + t[0]);

    return h.led.call(this, left);
  },

  next: function() {
    if (!this.tokens.length)
      throw new Error('Unexpected end of input');

    if (this.cur && this.cur[0] != 'whitespace')
      this.prev = this.cur;
    var t = this.cur = this.tokens.shift();

    if (t[0] == 'whitespace')
      return this.next();

    this._updateLines(t);
    return t;
  },
  peek: function(type, noConsume) {
    while (this.cur[0] == 'newline')
      this.next();

    if (this.cur[0] == type) {
      if (!noConsume)
        this.next();
      return true;
    }

    return false;
  },
  expect: function(type) {
    while (this.cur[0] == 'newline')
      this.next();

    if (this.cur[0] != type)
      throw new Error('Expected ' + type + ' got "' + this.cur[0] + '"');

    var ret = this.cur;
    this.next();
    return ret;
  },

  statement: function(rbp) {
    var t = this.cur;
    while (t[0] == 'newline' || t[0] == ';') {
      this.next();
      t = this.cur;
    }
    this.next();
    var left = this.nud(t);

    while ((rbp || 0) < this.lbp(this.cur)) {
      t = this.cur;
      this.next();
      left = this.led(t, left);
    }

    return left;
  },
  expression: function(rbp) {
    var tree = this.statement(rbp);

    if (!(tree instanceof syntax.Expression))
      throw new Error('Expected expression, got ' + tree.constructor.name);

    return tree;
  },
  block: function() {
    var statements = [];

    this.expect('{');
    while (!this.peek('}')) {
      statements.push(this.statement(0));
    }

    return statements;
  },
  assignmentBlock: function(allowStructs) {
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
  },
  typeRef: function() {
    var base = this.expect('identifier')[1];
    var generics = [];

    if (this.peek('<')) {
      do {
        generics.push(this.typeRef());
      } while (this.peek(':'));

      this.expect('>');
    }

    return new types.TypeRef(base, generics);
  },

  parse: function(allowBare) {
    allowBare = allowBare || false;
    this.tokens = tokenizer(this.src);
    this.cur = this.next();

    var statements = [];

    while (this.cur[0] != 'eof') {
      while (this.cur[0] == 'newline' || this.cur[0] == ';')
        this.next();
      var stmt = this.statement(0);
      if (!allowBare) {
        if (stmt instanceof syntax.Expression)
          throw new Error('Expression is not valid here')
      }
      statements.push(stmt);
      while (this.cur[0] == 'newline' || this.cur[0] == ';')
        this.next();
    }
    return statements;
  }
};

module.exports = function(src) {
  var engine = new Engine(src);

  try {
    return engine.parse(true);
  } catch (err) {

    try {
      // console.log(engine.tokens);
    } catch (err) {}

    if (!err.line) {
      err.line = engine.line;
      err.colStart = err.col = engine.colStart;
      err.colEnd = engine.colEnd;
      err.message += ' (' + err.line + ':' + err.colStart + '-' + err.colEnd + ')';
    }
    throw err;
  }
};
