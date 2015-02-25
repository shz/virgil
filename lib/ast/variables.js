var core = require('./core');

function VariableDeclaration(name, type, expression, override) {
  this.name = name;
  this.type = type;
  this.expression = expression;
  this.override = override;
  this.isArgument = false;
  this.from = null;
}

function MutableVariableDeclaration(name, type, expression, override) {
  this.name = name;
  this.type = type
  this.expression = expression;
  this.override = override;
}

function OutVariableDeclaration(name, type, expression, override) {
  this.name = name;
  this.type = type;
  this.expression = expression;
  this.override = override;
}

core.inherits(VariableDeclaration, core.Statement);
core.inherits(MutableVariableDeclaration, core.Statement);
core.inherits(OutVariableDeclaration, core.Statement);
