var syntax = require('../../ast')
  ;

exports['true'] = {
  nud: function() {
    return new syntax.TrueLiteral();
  }
};

exports['false'] = {
  nud: function() {
    return new syntax.FalseLiteral();
  }
};

exports['if'] = {
  nud: function() {
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

exports['&&'] = {
  lbp: 7,
  led: function(left) {
    return new syntax.LogicalAndExpression(left, this.statement(7));
  }
};

exports['||'] = {
  lbp: 6,
  led: function(left) {
    return new syntax.LogicalOrExpression(left, this.statement(6));
  }
};

exports['?'] = {
  lbp: 5,
  led: function(condition) {
    var left = this.statement(5);
    this.expect(':');
    var right = this.statement(5);

    return new syntax.TernaryExpression(condition, left, right);
  }
};

exports[':'] = {
  lbp: 5
};
