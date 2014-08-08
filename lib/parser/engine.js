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

    return h.lbp || 0;
  },
  nud: function(t) {
    var h = this._handler(t);

    if (!h.nud) {
      this._updateLines(this.prev);
      throw new Error('Unexpected token "' + t[0] + '"');
    }

    return h.nud.call(this, t[1], t[2]);
  },
  led: function(t, left) {
    var h = this._handler(t);
    if (!h.led)
      throw new Error('No led defined for ' + t[0]);

    return h.led.call(this, left, t[2]);
  },

  //
  // Gets the next token, skipping over whitespace
  //
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

  //
  // Checks if the next token is the type specified, returning a
  // boolean.  If the `noConsume` flag is true, the token will remain
  // as the current.  Otherwise, on success, the token will be consumed.
  //
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

  //
  // Requires that the next token (ignoring whitespace/newlines) is
  // the type specified.  Returns the token tuple on success, throws
  // an error on failure.
  //
  expect: function(type) {
    while (this.cur[0] == 'newline')
      this.next();

    if (this.cur[0] != type)
      throw new Error('Expected ' + type + ' got "' + this.cur[0] + '"');

    var ret = this.cur;
    this.next();
    return ret;
  },

  //
  // Parses the next statement/expression.  Poorly named, I know.
  //
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

  //
  // Parses the source, returning a syntax tree
  //
  parse: function(allowBare) {
    allowBare = allowBare || false;
    this.tokens = tokenizer(this.src);
    this.cur = this.next();

    var statements = [];

    while (this.cur[0] != 'eof') {
      while (this.cur[0] == 'newline' || this.cur[0] == ';')
        this.next();
      if (this.cur[0] == 'eof')
        break;

      var stmt = this.statement(0);
      if (!allowBare) {
        if (stmt instanceof syntax.Expression)
          throw new Error('Expressions are invalid at root scope when compiling in module mode')
      }
      statements.push(stmt);
      while (this.cur[0] == 'newline' || this.cur[0] == ';')
        this.next();
    }
    return statements;
  }
};

var components = require('./components');
for (var i in components) if (components.hasOwnProperty(i))
  Engine.prototype[i] = components[i];

module.exports = function(src, allowBare) {
  var engine = new Engine(src);

  try {
    return engine.parse(!!allowBare);
  } catch (err) {
    if (!err.start) {
      err.start = { line: engine.line, col: engine.colStart };
      err.end = { line: engine.line, col: engine.colEnd };
    }
    throw err;
  }
};
