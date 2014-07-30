var syntax = require('../../ast')
  ;

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
