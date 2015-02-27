var core = require('./core');

function LogicExpression() {}

function NotExpression(expression) {
  this.expression = expression;
}

function TernaryExpression(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.condition.loc.start,
    end: this.right.loc.end
  };
}

function EqualsExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function NotEqualsExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function GreaterThanExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LessThanExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function GreaterThanEqualExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LessThanEqualExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LogicalOrExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LogicalAndExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function IfStatement(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.condition.loc.start,
    end: this.right ? this.right.loc.end : this.left.loc.end
  };
}

core.inherits(LogicExpression, core.Expression);
core.inherits(NotExpression, LogicExpression);
core.inherits(GreaterThanExpression, LogicExpression);
core.inherits(LessThanExpression, LogicExpression);
core.inherits(GreaterThanEqualExpression, LogicExpression);
core.inherits(LessThanEqualExpression, LogicExpression);
core.inherits(EqualsExpression, LogicExpression);
core.inherits(NotEqualsExpression, LogicExpression);
core.inherits(TernaryExpression, LogicExpression);
core.inherits(IfStatement, core.Statement);
core.inherits(LogicalAndExpression, LogicExpression);
core.inherits(LogicalOrExpression, LogicExpression);
