var core = require('./core');

function StructStatement(name, body, ex, generics) {
  this.name = name;
  this.body = body;
  this.ex = !!ex;
  this.importedFrom = null;
  this.generics = generics || [];
}

function NewExpression(type, args) {
  this.type = type;
  this.args = args;
}

core.inherits(StructStatement, core.Statement);
core.inherits(NewExpression, core.Expression);
