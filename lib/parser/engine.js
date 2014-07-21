var tokenizer = require('./tokenizer')
  , handlers = require('./handlers')
  ;

var Engine = function Engine(src) {
  this.src = src;
  this.tokens = tokenizer(src);
  this.cur = this.next();
  this.line = 0;
  this.colStart = 0;
  this.colEnd = 0;
};

Engine.prototype = {
  constructor: Engine,

  _handler: function(t) {
    if (!handlers[t[0]])
      throw new Error('No handler for ' + t[0]);

    return handlers[t[0]];
  },

  lbp: function(t, left) {
    var h = this._handler(t);
    if (typeof h.lbp != 'number')
      throw new Error('No lbp defined for ' + t[0]);

    return this._handler.lbp;
  },
  nud: function(t) {
    var h = this._handler(t);
    if (!h.nud)
      throw new Error('Unexpected token ' + t[0]);

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

    var t = this.cur = this.tokens.shift();
    if (t[0] == 'whitespace')
      return this.next();
    else
      return t;
  },
  expect: function(type) {
    if (this.cur[0] != type)
      throw new Error('Expected ' + type + ' got ' + this.cur[0]);

    this.next();
  },

  statement: function(rbp) {
    var t = this.cur;
    this.next();
    var left = this.nud(t);

    while((rbp || 0) < this.lbp(this.cur)) {
      t = this.cur;
      this.next();
      left = this.led(t, left);
    }

    return left;
  },
  expression: function(rbp) {
    var tree = this.statement(rbp);

    // TODO - Fix line numbers and such
    if (tree instanceof ast.Expression)
      throw new ParseError('Expected expression, got ' + tree.constructor.name);

    return tree;
  },

  parse: function() {
    var statements = [];
    while (this.cur != 'eof')
      statements.push(this.statement(0));
    return statements;
  }
};

module.exports = function(src) {
  var engine = new Engine(src);

  try {
    return engine.parse();
  } catch (err) {
    err.line = engine.line;
    err.colStart = err.col = engine.colStart;
    err.colEnd = engine.colEnd;
    err.message += ' ' + err.line + ':' + err.colStart;
    throw err;
  }
};
