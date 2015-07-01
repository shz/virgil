var tokenizer = require('../tokenizer')
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
  this.cur = null; // Next token in stream; not yet processed
  this.prev = null; // Previous token in stream; was processed
};

Engine.prototype = {
  constructor: Engine,

  _handler: function(t) {
    if (!handlers[t.name]) {
      throw new Error('No handler for ' + t.name + '.  You found a parser bug!');
    }

    return handlers[t.name];
  },

  lbp: function(t, left) {
    return precedence[t.name] || 0;
  },
  nud: function(t) {
    var h = this._handler(t);

    if (!h.nud) {
      throw new Error('Unexpected token "' + t.name + '"');
    }

    var start = t.loc.start;
    var end = start;
    var node = h.nud.call(this, t);
    end = this.prev.loc.end;
    node.loc = { start: start, end: end };
    return node;
  },
  led: function(t, left) {
    var h = this._handler(t);
    if (!h.led)
      throw new Error('No led defined for ' + t.name);

    var start = left.loc.start;
    var end = t.loc.end;
    var node = h.led.call(this, left, t);
    end = this.prev.loc.end;
    node.loc = { start: start, end: end };
    return node;
  },

  //
  // Gets the next token, skipping over whitespace
  //
  next: function() {
    if (!this.tokens.length)
      throw new Error('Unexpected end of input');

    if (this.cur && this.cur.name != 'whitespace')
      this.prev = this.cur;
    var t = this.cur = this.tokens.shift();

    if (t.name == 'whitespace')
      return this.next();

    return t;
  },

  //
  // Checks if the next token is the type specified, returning a
  // boolean.  If the `noConsume` flag is true, the token will remain
  // as the current.  Otherwise, on success, the token will be consumed.
  //
  peek: function(type, noConsume, allowSemicolon) {
    while (this.cur.name == 'newline' || (allowSemicolon && this.cur.name == ';'))
      this.next();

    if (this.cur.name == type) {
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
    while (this.cur.name == 'newline') {
      try {
        this.next();
      } catch (err) {
        throw new Error('Expected ' + type + ' but got unexpected end of input');
      }
    }

    if (this.cur.name != type)
      throw new Error('Expected ' + type + ' but got "' + this.cur.name + '"');

    var ret = this.cur;
    this.next();
    return ret;
  },

  //
  // Parses the next statement/expression.  Poorly named, I know.
  //
  statement: function(rbp) {
    var t = this.cur;
    while (t.name == 'newline') {
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

    while (this.cur.name != 'eof') {
      while (this.cur.name == 'newline' || this.cur.name == ';')
        this.next();
      if (this.cur.name == 'eof')
        break;

      var stmt = this.statement(0);
      if (!allowBare) {
        if (stmt instanceof syntax.Expression)
          throw new Error('Expressions are invalid at root scope when compiling in module mode');
      }
      statements.push(stmt);
      while (this.cur.name == 'newline' || this.cur.name == ';')
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
    if (!err.loc) {
      err.loc = engine.prev.loc;
    }
    err.src = src;
    throw err;
  }
};
