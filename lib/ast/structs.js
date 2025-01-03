var core = require('./core');

function StructStatement(name, body, ex, generics) {
  this.name = name;
  this.body = body; // AssignmentBlock
  this.ex = !!ex;
  this.importedFrom = null;
  this.generics = generics || [];
}

function NewExpression(type, args) {
  this.type = type;
  this.args = args; // AssignmentBlock
}

function PropertyAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = false; // FIXME - Remove

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

core.inherits(StructStatement, core.Statement);
core.inherits(NewExpression, core.Expression);
core.inherits(PropertyAccessExpression, core.Expression);
