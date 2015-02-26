var tokenizer = require('./tokenizer')
  , handlers = require('./handlers')
  , precedence = require('./precedence')
  , syntax = require('../ast')
  , types = require('../types')
  ;

var Engine = function Engine(src) {
  if (src instanceof Array) {
    this.src = null;
    this.tokens = src;
  } else {
    this.src = src;
    this.tokens = [];
  }
  this.cur = null;
  this.prev = null;
};

Engine.prototype = {
  constructor: Engine,

  _handler: function(t) {
    if (!handlers[t[0]]) {
      throw new Error('No handler for ' + t[0] + '.  You found a parser bug!');
    }

    return handlers[t[0]];
  },

  lbp: function(t, left) {
    return precedence[t[0]] || 0;
  },
  nud: function(t) {
    var h = this._handler(t);

    if (!h.nud) {
      throw new Error('Unexpected token "' + t[0] + '"');
    }

    var start = {
      line: t[2].line,
      col: t[2].start
    };
    var end = start;
    var node = h.nud.call(this, t[1], t[2]);
    end = { line: this.prev[2].line, col: this.prev[2].end };
    node.loc = { start: start, end: end };
    return node;
  },
  led: function(t, left) {
    var h = this._handler(t);
    if (!h.led)
      throw new Error('No led defined for ' + t[0]);

    var start = left.loc.start;
    var end = { line: t[2].line, col: t[2].end };
    var node = h.led.call(this, left, t[2]);
    end = { line: this.prev[2].line, col: this.prev[2].end };
    node.loc = { start: start, end: end };
    return node;
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

    return t;
  },

  //
  // Checks if the next token is the type specified, returning a
  // boolean.  If the `noConsume` flag is true, the token will remain
  // as the current.  Otherwise, on success, the token will be consumed.
  //
  peek: function(type, noConsume, allowSemicolon) {
    while (this.cur[0] == 'newline' || (allowSemicolon && this.cur[0] == ';'))
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
    while (this.cur[0] == 'newline') {
      try {
        this.next();
      } catch (err) {
        throw new Error('Expected ' + type + ' but got unexpected end of input');
      }
    }

    if (this.cur[0] != type)
      throw new Error('Expected ' + type + ' but got "' + this.cur[0] + '"');

    var ret = this.cur;
    this.next();
    return ret;
  },

  //
  // Parses the next statement/expression.  Poorly named, I know.
  //
  statement: function(rbp) {
    var t = this.cur;
    while (t[0] == 'newline') {
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
    if (!this.tokens.length) {
      this.tokens = tokenizer(this.src);
    }
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
          throw new Error('Expressions are invalid at root scope when compiling in module mode');
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
    return engine.parse(allowBare);
  } catch (err) {
    if (!err.start) {
      err.start = { line: engine.prev[2].line, col: engine.prev[2].start };
      err.end = { line: engine.prev[2].line, col: engine.prev[2].end };
    }
    throw err;
  }
};
