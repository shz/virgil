var core = require('./core');

function FunctionStatement(name, args, returnType, body, ex) {
  this.name = name;
  this.args = args; // array of [name, type]
  this.returnType = returnType;
  this.body = body;
  this.ex = !!ex;
  this.importedFrom = null;
}

function MethodStatement(name, args, returnType, body, ex) {
  this.name = name;
  this.args = args; // array of [name, type]
  this.returnType = returnType;
  this.body = body;
  this.ex = !!ex;
  this.nat = false;
  this.importedFrom = null;
}

function ReturnStatement(expression) {
  this.expression = expression;
}

function LambdaExpression(args, body, type) {
  this.args = args; // array of [name, type]
  this.body = body;
  this.inferredTypes = [];
  this.returnType = type;
}

function FunctionCallExpression(left, args) {
  this.args = args; // array of expressions
  this.left = left;
  this.type = null;
}

core.inherits(FunctionStatement, core.Statement);
core.inherits(MethodStatement, core.Statement);
core.inherits(ReturnStatement, core.Statement);
core.inherits(LambdaExpression, core.Expression);
core.inherits(FunctionCallExpression, core.Expression);
