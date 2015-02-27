var core = require('./core');

function ArithmeticExpression() {}

function NegationExpression(expression) {
  this.expression = expression;
}

function MultiplicationExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function AdditionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function SubtractionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function DivisionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function PowerExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function ModExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

core.inherits(ArithmeticExpression, core.Expression);
core.inherits(NegationExpression, ArithmeticExpression);
core.inherits(MultiplicationExpression, ArithmeticExpression);
core.inherits(AdditionExpression, ArithmeticExpression);
core.inherits(SubtractionExpression, ArithmeticExpression);
core.inherits(DivisionExpression, ArithmeticExpression);
core.inherits(PowerExpression, ArithmeticExpression);
core.inherits(ModExpression, ArithmeticExpression);
