var core = require('./core');

function ListAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = !(this.right instanceof core.IntegerLiteral);
}

function ListExpression(body) {
  this.body = body;
}

core.inherits(ListAccessExpression, core.Expression);
core.inherits(ListExpression, core.Expression);
