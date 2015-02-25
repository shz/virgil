var core = require('./core');

function BlockStatement(owner, statements) {
  this.owner = owner;
  this.body = statements;
}

function Identifier(name) {
  this.name = name;
  this.def = null;

  this.loc = {
    start: {},
    end: {}
  };
}

function AssignmentStatement(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function AssignmentBlock(declarations) {
  this.declarations = declarations || [];
}

function PropertyAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = false;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function TryCatchStatement(_try, _catch) {
  this.left = _try;
  this.right = _catch;
}

core.inherits(BlockStatement, core.Statement);
core.inherits(Identifier, core.Expression);
core.inherits(AssignmentStatement, core.Statement);
core.inherits(AssignmentBlock, core.Statement); // Changed from Expression?
core.inherits(PropertyAccessExpression, core.Expression);
core.inherits(TryCatchStatement, core.Statement);
