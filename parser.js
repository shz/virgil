var ast = require('./ast')
  , tokenizer = require('./tokenizer')
  ;

var handlers = {};
handlers['eof'] = {
  lbp: 0
};
handlers['plus'] = {
  lbp: 10,
  led: function(left) {
    return new ast.AdditionExpression(left, this._expression(10));
  }
};
handlers['minus'] = {
  lbp: 10,
  nud: function(value) {
    var n = this._expression(10);
    if (n instanceof ast.IntegerLiteral)
      return new ast.IntegerLiteral('-' + n.value);
    if (n instanceof ast.FloatLiteral)
      return new ast.FloatLiteral('-' + n.value);

    throw new Error('Invalid - in front of ' + n.constructor.name);
  },
  led: function(left) {
    return new ast.SubtractionExpression(left, this._expression(10));
  }
};
handlers['mul'] = {
  lbp: 20,
  led: function(left) {
    return new ast.MultiplicationExpression(left, this._expression(20));
  }
};
handlers['div'] = {
  lbp: 20,
  led: function(left) {
    return new ast.DivisionExpression(left, this._expression(20));
  }
};
handlers['int'] = {
  nud: function(value) {
    return new ast.IntegerLiteral(value);
  }
};
handlers['float'] = {
  nud: function(value) {
    return new ast.FloatLiteral(value);
  }
};
handlers['lparen'] = {
  lbp: 0,
  nud: function(value) {
    var exp = this._expression(0);
    this._expect('rparen');
    return exp;
  }
};
handlers['rparen'] = {
  lbp: 0
};
handlers['qmark'] = {
  lbp: 5,
  led: function(condition) {
    var left = this._expression(5);
    this._expect('colon');
    var right = this._expression(5);

    return new ast.TernaryExpression(condition, left, right);
  }
};
handlers['colon'] = {
  lbp: 5
};
handlers['true'] = {
  nud: function() {
    return new ast.TrueExpression();
  }
};
handlers['false'] = {
  nud: function() {
    return new ast.FalseExpression();
  }
};
handlers['if'] = {
  nud: function() {
    this._expect('lparen');
    var condition = this._expression(0);
    this._expect('rparen');
    var left = this._expression(0);

    return new ast.IfStatement(condition, left);
  }
};

handlers['lsquig'] = {
  nud: function() {
    var statements = [];
    while (this._curToken[0] != 'rsquig')
      statements.push(this._expression(0));
    this._expect('rsquig');
    return new ast.BlockStatement(statements);
  }
};
handlers['rsquig'] = {
  lbp: 0
};

var Parser = module.exports = function Parser(src) {
  this.src = src;
  this.tokens = tokenizer(src);
  this._curToken = this._next();
};
Parser.prototype = {
  constructor: Parser,

  _lbp: function(t) {
    if (!handlers[t[0]]) throw new Error('No handler for ' + t[0]);
    return handlers[t[0]].lbp;
  },
  _nud: function(t) {
    if (!handlers[t[0]]) throw new Error('No handler for ' + t[0]);
    var f = handlers[t[0]].nud;
    if (!f) throw new Error('No nud for ' + t[0]);

    return f.call(this, t[1]);
  },
  _led: function(t, left) {
    if (!handlers[t[0]]) throw new Error('No handler for ' + t[0]);
    var f = handlers[t[0]].led;
    if (!f) throw new Error('No led for ' + t[0]);

    return f.call(this, left);
  },
  _next: function() {
    if (!this.tokens.length)
      throw new Error('Out of tokens');

    var t = this._curToken = this.tokens.shift();
    if (t[0] == 'whitespace')
      return this._next();
    else
      return t;
  },
  _consume: function(type) {
    var t = this._next();
    if (t[0] != type)
      throw new Error('Expected ' + type + ', got ' + t[0]);
  },
  _expect: function(type) {
    var t = this._curToken
    if (t[0] != type)
      throw new Error('Expected ' + type + ', got ' + t[0]);
    this._curToken = this._next();
  },
  _expression: function(rbp) {
    var t = this._curToken;
    this._next();
    var left = this._nud(t);

    while ((rbp || 0) < this._lbp(this._curToken)) {
      t = this._curToken;
      this._next();
      left = this._led(t, left);
    }

    return left;
  },

  parse: function() {
    var expressions = [];

    while (this._curToken != 'eof')
      expressions.push(this._expression(0));

    return expressions;
  }
};
