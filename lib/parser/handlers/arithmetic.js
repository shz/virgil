var syntax = require('../../ast')
  ;

/* istanbul ignore next */
exports['+'] = {
  lbp: 10,
  led: function(left) {
    return new syntax.AdditionExpression(left, this.expression(10));
  }
};

/* istanbul ignore next */
exports['-'] = {
  lbp: 10,
  nud: function(value) {
    var n = this.expression(10);
    if (n instanceof syntax.IntegerLiteral)
      return new syntax.IntegerLiteral('-' + n.value);
    if (n instanceof syntax.FloatLiteral)
      return new syntax.FloatLiteral('-' + n.value);

    throw new Error('Invalid - in front of ' + n.constructor.name);
  },
  led: function(left) {
    return new syntax.SubtractionExpression(left, this.expression(10));
  }
};

/* istanbul ignore next */
exports['*'] = {
  lbp: 20,
  led: function(left) {
    return new syntax.MultiplicationExpression(left, this.expression(20));
  }
};

/* istanbul ignore next */
exports['/'] = {
  lbp: 20,
  led: function(left) {
    return new syntax.DivisionExpression(left, this.expression(20));
  }
};

/* istanbul ignore next */
exports['**'] = {
  lbp: 19,
  led: function(left) {
    return new syntax.PowerExpression(left, this.expression(19));
  }
};

/* istanbul ignore next */
exports['%'] = {
  lbp: 18,
  led: function(left) {
    return new syntax.ModExpression(left, this.expression(18));
  }
}
