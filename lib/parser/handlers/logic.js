var precedence = require('../precedence')
  , ast = require('../../ast')
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

    var node = new ast.IfStatement(condition, left, right);
    left.owner = node;
    if (right && right.constructor == ast.BlockStatement)
      right.owner = node;
    return node;
  }
};

exports['else'] = {};
exports[':'] = {};

exports['&&'] = {
  led: function(left) {
    return new ast.LogicalAndExpression(left, this.statement(precedence['&&']));
  }
};

exports['||'] = {
  led: function(left) {
    return new ast.LogicalOrExpression(left, this.statement(precedence['||']));
  }
};

exports['?'] = {
  led: function(condition) {
    var left = this.statement(precedence['?']);
    this.expect(':');
    var right = this.statement(precedence[':']);

    return new ast.TernaryExpression(condition, left, right);
  }
};

exports['!'] = {
  nud: function(value, loc) {
    var node = new ast.NotExpression(this.expression(precedence['!']));
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
  led: function(left) {
    return new ast.GreaterThanExpression(left, this.expression(precedence['>']));
  }
};

exports['<'] = {
  led: function(left) {
    return new ast.LessThanExpression(left, this.expression(precedence['<']));
  }
};

exports['>='] = {
  led: function(left) {
    return new ast.GreaterThanEqualExpression(left, this.expression(precedence['>=']));
  }
};

exports['<='] = {
  led: function(left) {
    return new ast.LessThanEqualExpression(left, this.expression(precedence['<=']));
  }
};

exports['=='] = {
  led: function(left) {
    return new ast.EqualsExpression(left, this.expression(precedence['==']));
  }
};

exports['!='] = {
  led: function(left) {
    return new ast.NotEqualsExpression(left, this.expression(precedence['!=']));
  }
};

