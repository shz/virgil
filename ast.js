var inherit = function(Child, Parent) {
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  // Kind of a kludge, but...
  exports[Child.name] = Child;
};

function Expression() {};
Expression.prototype.toTreeString = function() {
  return this.repr('');
};
Expression.prototype.repr = function(indent) {
  var s = indent + this.constructor.name;
  if (this.value)
    s += ': ' + this.value.toString();
  if (this.condition)
    s += '\n' + this.condition.repr(indent + '  ');
  if (this.left)
    s += '\n' + this.left.repr(indent + '  ');
  if (this.right)
    s += '\n' + this.right.repr(indent + '  ');
  if (this.body)
    this.body.forEach(function(statement) {
      s += '\n' + statement.repr(indent + '  ');
    });

  return s;
};

// Literals

function StringLiteral(value) {
  this.value = value;
};

function IntegerLiteral(value) {
  this.value = value;
};

function FloatLiteral(value) {
  this.value = value;
};

inherit(StringLiteral, Expression);
inherit(IntegerLiteral, Expression);
inherit(FloatLiteral, Expression);

// Misc

function TrueExpression() {

};

function FalseExpression() {

};

function TernaryExpression(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;
};

inherit(TernaryExpression, Expression);
inherit(TrueExpression, Expression);
inherit(FalseExpression, Expression);

// Arithmetic

function MultiplicationExpression(left, right) {
  this.left = left;
  this.right = right;
};

function AdditionExpression(left, right) {
  this.left = left;
  this.right = right;
};

function SubtractionExpression(left, right) {
  this.left = left;
  this.right = right;
};

function DivisionExpression(left, right) {
  this.left = left;
  this.right = right;
};

function PowerExpression(left, right) {
  this.left = left;
  this.right = right;
};

function ModExpression(left, right) {
  this.left = left;
  this.right = right;
};

inherit(MultiplicationExpression, Expression);
inherit(AdditionExpression, Expression);
inherit(SubtractionExpression, Expression);
inherit(DivisionExpression, Expression);
inherit(PowerExpression, Expression);
inherit(ModExpression, Expression);

// Logic

function IfStatement(condition, left) {
  this.condition = condition;
  this.left = left;
};

inherit(IfStatement, Expression);

// Misc

function BlockStatement(statements) {
  this.body = statements;
};

inherit(BlockStatement, Expression);
