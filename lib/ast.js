var inherit = function(Child, Parent) {
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  // Kind of a kludge, but...
  exports[Child.name] = Child;
};

function Statement() {};
Statement.prototype.toTreeString = function() {
  return this.repr('');
};
Statement.prototype.repr = function(indent) {
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


function Expression() {};
inherit(Expression, Statement);

// Literals

function StringLiteral(value) {
  this.value = value;
};

function IntegerLiteral(value) {
  this.value = parseInt(value, 10);
};

function FloatLiteral(value) {
  this.value = parseFloat(value);
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

function LogicalOrExpression(left, right) {
  this.left = left;
  this.right = right;
};

function LogicalAndExpression(left, right) {
  this.left = left;
  this.right = right;
};

function IfStatement(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;
};

inherit(IfStatement, Statement);
inherit(LogicalAndExpression, Expression);
inherit(LogicalOrExpression, Expression);

// Misc

function BlockStatement(statements) {
  this.body = statements;
};

inherit(BlockStatement, Statement);
