var core = require('./core');

function WhileStatement(expression, body) {
  this.expression = expression;
  this.body = body;
}

function ForStatement(declaration, end, up, body) {
  this.declaration = declaration;
  this.up = up;
  this.end = end;
  this.body = body;
}

function BreakStatement() {}
function ContinueStatement() {}

core.inherits(WhileStatement, core.Statement);
core.inherits(ForStatement, core.Statement);
core.inherits(BreakStatement, core.Statement);
core.inherits(ContinueStatement, core.Statement);
