var ast = require('../../ast')
  ;

/* istanbul ignore next */
exports['+'] = {
  lbp: 15,
  led: function(left) {
    return new ast.AdditionExpression(left, this.expression(10));
  }
};

/* istanbul ignore next */
exports['-'] = {
  lbp: 15,
  nud: function(value, loc) {
    var expression = this.expression(10);
    var node = new ast.NegationExpression(expression);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: node.expression.end
    };
    return node;
  },
  led: function(left) {
    return new ast.SubtractionExpression(left, this.expression(10));
  }
};

/* istanbul ignore next */
exports['*'] = {
  lbp: 20,
  led: function(left) {
    return new ast.MultiplicationExpression(left, this.expression(20));
  }
};

/* istanbul ignore next */
exports['/'] = {
  lbp: 20,
  led: function(left) {
    return new ast.DivisionExpression(left, this.expression(20));
  }
};

/* istanbul ignore next */
exports['**'] = {
  lbp: 19,
  led: function(left) {
    return new ast.PowerExpression(left, this.expression(19));
  }
};

/* istanbul ignore next */
exports['%'] = {
  lbp: 18,
  led: function(left) {
    return new ast.ModExpression(left, this.expression(18));
  }
}
