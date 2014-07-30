var syntax = require('../../ast')
  ;

exports['eof'] = {
  lbp: 0
};
exports['plus'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.AdditionExpression(left, this.statement(10));
  }
};
exports['minus'] = {
  lbp: 10,
  nud: function(value) {
    var n = this.statement(10);
    if (n instanceof syntax.IntegerLiteral)
      return new syntax.IntegerLiteral('-' + n.value);
    if (n instanceof syntax.FloatLiteral)
      return new syntax.FloatLiteral('-' + n.value);

    throw new Error('Invalid - in front of ' + n.constructor.name);
  },
  led: function(left) {
    return new syntax.SubtractionExpression(left, this.statement(10));
  }
};
exports['mul'] = {
  lbp: 20,
  led: function(left) {
    return new syntax.MultiplicationExpression(left, this.statement(20));
  }
};
exports['div'] = {
  lbp: 20,
  led: function(left) {
    return new syntax.DivisionExpression(left, this.statement(20));
  }
};
exports['pow'] = {
  lbp: 19,
  led: function(left) {
    return new syntax.PowerExpression(left, this.statement(19));
  }
};
exports['doubleand'] = {
  lbp: 7,
  led: function(left) {
    return new syntax.LogicalAndExpression(left, this.statement(7));
  }
};
exports['doubleor'] = {
  lbp: 6,
  led: function(left) {
    return new syntax.LogicalOrExpression(left, this.statement(6));
  }
};
exports['int'] = {
  nud: function(value) {
    return new syntax.IntegerLiteral(value);
  }
};
exports['float'] = {
  nud: function(value) {
    return new syntax.FloatLiteral(value);
  }
};
exports['lparen'] = {
  lbp: 0,
  nud: function(value) {
    var exp = this.statement(0);
    this.expect('rparen');
    return exp;
  }
};
exports['rparen'] = {
  lbp: 0
};
exports['qmark'] = {
  lbp: 5,
  led: function(condition) {
    var left = this.statement(5);
    this.expect('colon');
    var right = this.statement(5);

    return new syntax.TernaryExpression(condition, left, right);
  }
};
exports['colon'] = {
  lbp: 5
};
exports['true'] = {
  nud: function() {
    return new syntax.TrueExpression();
  }
};
exports['false'] = {
  nud: function() {
    return new syntax.FalseExpression();
  }
};
exports['if'] = {
  nud: function() {
    debugger;
    var condition = this.expression(0);
    var left = new syntax.BlockStatement(this.block());
    var right = null;

    // This forces us to have an LBP for all possible expressions
    if (this.peek('else')) {
      if (this.peek('if', true))
        right = this.statement(0);
      else
        right = new syntax.BlockStatement(this.block(0));
    }

    return new syntax.IfStatement(condition, left, right);
  }
};
exports['else'] = {
  lbp: 0
};

exports['lsquig'] = {
  lbp: 0,
  nud: function() {
    var statements = [];
    while (!this.peek('rsquig'))
      statements.push(this.statement(0));
    return new syntax.BlockStatement(statements);
  }
};
exports['rsquig'] = {
  lbp: 0
};

exports['identifier'] = {
  nud: function(value) {
    return new syntax.Identifier(value);
  }
};

exports['newline'] = {
  lbp: 0
}
exports['semicolon'] = {
  lbp: 0
}
