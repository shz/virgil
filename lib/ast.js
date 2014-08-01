var inherit = function(Child, Parent) {
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  // Kind of a kludge, but...
  exports[Child.name] = Child;
};

function Statement() {}
Statement.prototype.repr = function(indent) {
  indent = indent || '';
  var s = indent + this.constructor.name;

  if (this.value)
    s += ': ' + this.value.toString();
  else if (this.name)
    s += ':' + this.name.toString();

  if (this.condition)
    s += '\n' + this.condition.repr(indent + '  ');
  if (this.left)
    s += '\n' + this.left.repr(indent + '  ');
  if (this.right)
    s += '\n' + this.right.repr(indent + '  ');
  if (this.expression)
    s += '\n' + this.expression.repr(indent + '  ');
  if (this.body)
    this.body.forEach(function(statement) {
      s += '\n' + statement.repr(indent + '  ');
    });

  return s;
};
Statement.prototype.toString = function() {
  return this.repr();
};


function Expression() {}
inherit(Expression, Statement);

// Literals

function StringLiteral(value) {
  this.value = value;
}

function IntegerLiteral(value) {
  this.value = parseInt(value, 10);
}

function FloatLiteral(value) {
  this.value = parseFloat(value);
}

inherit(StringLiteral, Expression);
inherit(IntegerLiteral, Expression);
inherit(FloatLiteral, Expression);

// Arithmetic

function MultiplicationExpression(left, right) {
  this.left = left;
  this.right = right;
}

function AdditionExpression(left, right) {
  this.left = left;
  this.right = right;
}

function SubtractionExpression(left, right) {
  this.left = left;
  this.right = right;
}

function DivisionExpression(left, right) {
  this.left = left;
  this.right = right;
}

function PowerExpression(left, right) {
  this.left = left;
  this.right = right;
}

function ModExpression(left, right) {
  this.left = left;
  this.right = right;
}

inherit(MultiplicationExpression, Expression);
inherit(AdditionExpression, Expression);
inherit(SubtractionExpression, Expression);
inherit(DivisionExpression, Expression);
inherit(PowerExpression, Expression);
inherit(ModExpression, Expression);

// Logic

function TrueExpression() {

}

function FalseExpression() {

}

function TernaryExpression(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;
}

function LogicalOrExpression(left, right) {
  this.left = left;
  this.right = right;
}

function LogicalAndExpression(left, right) {
  this.left = left;
  this.right = right;
}

function IfStatement(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;
}

inherit(TrueExpression, Expression);
inherit(FalseExpression, Expression);
inherit(TernaryExpression, Expression);
inherit(IfStatement, Statement);
inherit(LogicalAndExpression, Expression);
inherit(LogicalOrExpression, Expression);

// Functions

function FunctionStatement(name, args, returnType, body) {
  this.name = name;
  this.args = args;
  this.type = returnType;
  this.body = body;
}

function ReturnStatement(expression) {
  this.expression = expression;
}

inherit(FunctionStatement, Statement);
inherit(ReturnStatement, Statement);

// Variable declarations

function VariableDeclaration(name, type, expression) {
  this.name = name;
  this.type = type;
  this.expression = expression;
}

function MutableVariableDeclaration(name, type, expression) {
  this.name = name;
  this.type = type
  this.expression = expression;
}

function OutVariableDeclaration(name, type, expression) {
  this.name = name;
  this.type = type;
  this.expression = expression;
}

inherit(VariableDeclaration, Statement);
inherit(MutableVariableDeclaration, Statement);
inherit(OutVariableDeclaration, Statement);

// Misc

function StructStatement(name, body) {
  this.name = name;
  this.body = body;
}

function BlockStatement(statements) {
  this.body = statements;
}

function Identifier(name) {
  this.name = name;
}

function AssignmentStatement(left, right) {
  this.left = left;
  this.right = right;
}

function AssignmentBlock(declarations) {
  this.declarations = declarations || [];
}

function FunctionCallExpression(left, args) {
  this.args = args;
  this.left = left;
}

function PropertyAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = !(this.right instanceof Identifier);
}

function ListExpression(body) {
  this.body = body;
}

inherit(StructStatement, Statement);
inherit(BlockStatement, Statement);
inherit(Identifier, Expression);
inherit(AssignmentStatement, Statement);
inherit(AssignmentBlock, Statement);
inherit(FunctionCallExpression, Expression);
inherit(PropertyAccessExpression, Expression);
inherit(ListExpression, Expression);
