var syntax = require('../../ast')
  ;

exports['if'] = {
  nud: function() {
    var condition = this.expression(0);
    var left = this.block();
    var right = null;

    // This forces us to have an LBP for all possible expressions
    if (this.peek('else')) {
      if (this.peek('if', true))
        right = this.statement(0);
      else
        right = this.block();
    }

    var node = new syntax.IfStatement(condition, left, right);
    left.owner = node;
    if (right && right.constructor == syntax.BlockStatement)
      right.owner = node;
    return node;
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

exports['!'] = {
  lbp: 11,
  nud: function(value, loc) {
    var node = new syntax.NotExpression(this.expression(11));
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: node.expression.end
    };
    return node;
  }
};

exports['>'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.GreaterThanExpression(left, this.expression(10));
  }
};

exports['<'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.LessThanExpression(left, this.expression(10));
  }
};

exports['>='] = {
  lbp: 10,
  led: function(left) {
    return new syntax.GreaterThanEqualExpression(left, this.expression(10));
  }
};

exports['<='] = {
  lbp: 10,
  led: function(left) {
    return new syntax.LessThanEqualExpression(left, this.expression(10));
  }
};

exports['=='] = {
  lbp: 8,
  led: function(left) {
    return new syntax.EqualsExpression(left, this.expression(8));
  }
};

exports['!='] = {
  lbp: 8,
  led: function(left) {
    return new syntax.NotEqualsExpression(left, this.expression(8));
  }
};

