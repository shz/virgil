var precedence = require('../precedence')
  , ast = require('../../ast')
  , util = require('./util')
  ;

// Never shows up directly, here for sake of completeness
exports['else'] = {};
exports[':'] = {};

util.binaryExpression(exports, '&&', ast.LogicalAndExpression);
util.binaryExpression(exports, '||', ast.LogicalOrExpression);
util.binaryExpression(exports, '>', ast.GreaterThanExpression);
util.binaryExpression(exports, '<', ast.LessThanExpression);
util.binaryExpression(exports, '>=', ast.GreaterThanEqualExpression);
util.binaryExpression(exports, '<=', ast.LessThanEqualExpression);
util.binaryExpression(exports, '==', ast.EqualsExpression);
util.binaryExpression(exports, '!=', ast.NotEqualsExpression);

exports['?'] = {
  led: function(condition) {
    var left = this.statement(precedence['?']);
    this.expect(':');
    var right = this.statement(precedence[':']);

    return new ast.TernaryExpression(condition, left, right);
  }
};

exports['!'] = {
  nud: function(t) {
    return new ast.NotExpression(this.expression(precedence['!']));
  }
};

exports['if'] = {
  nud: function(t) {
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
