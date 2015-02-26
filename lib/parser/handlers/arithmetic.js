var ast = require('../../ast')
  , precedence = require('../precedence')
  ;

exports['+'] = {
  led: function(left) {
    return new ast.AdditionExpression(left, this.expression(precedence['+']));
  }
};

exports['-'] = {
  nud: function(value, loc) {
    var expression = this.expression(precedence['-']);
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
    return new ast.SubtractionExpression(left, this.expression(precedence['-']));
  }
};

exports['*'] = {
  led: function(left) {
    return new ast.MultiplicationExpression(left, this.expression(precedence['*']));
  }
};

exports['/'] = {
  led: function(left) {
    return new ast.DivisionExpression(left, this.expression(precedence['/']));
  }
};

exports['**'] = {
  led: function(left) {
    return new ast.PowerExpression(left, this.expression(precedence['**']));
  }
};

exports['%'] = {
  led: function(left) {
    return new ast.ModExpression(left, this.expression(precedence['%']));
  }
}
