var syntax = require('../../ast')
  ;

/* istanbul ignore next */
exports['true'] = {
  nud: function() {
    return new syntax.TrueLiteral();
  }
};

/* istanbul ignore next */
exports['false'] = {
  nud: function() {
    return new syntax.FalseLiteral();
  }
};

/* istanbul ignore next */
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

    return new syntax.IfStatement(condition, left, right);
  }
};

/* istanbul ignore next */
exports['else'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['&&'] = {
  lbp: 7,
  led: function(left) {
    return new syntax.LogicalAndExpression(left, this.statement(7));
  }
};

/* istanbul ignore next */
exports['||'] = {
  lbp: 6,
  led: function(left) {
    return new syntax.LogicalOrExpression(left, this.statement(6));
  }
};

/* istanbul ignore next */
exports['?'] = {
  lbp: 5,
  led: function(condition) {
    var left = this.statement(5);
    this.expect(':');
    var right = this.statement(5);

    return new syntax.TernaryExpression(condition, left, right);
  }
};

/* istanbul ignore next */
exports[':'] = {
  lbp: 5
};


/* istanbul ignore next */
exports['>'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.GreaterThanExpression(left, this.expression(10));
  }
}

/* istanbul ignore next */
exports['<'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.LessThanExpression(left, this.expression(10));
  }
}


/* istanbul ignore next */
exports['=='] = {
  lbp: 8,
  led: function(left) {
    return new syntax.EqualsExpression(left, this.expression(8));
  }
}
