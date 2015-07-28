var core = require('./core')
  , Token = require('../tokenizer/token')
  ;

function BlockStatement(owner, statements) {
  this.owner = owner;
  this.body = statements;
}

function Identifier(name) {
  if (name instanceof Token) {
    this.name = name.value;
    this.loc = name.loc;
  } else {
    this.name = name;
  }
  this.def = null;
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
  // Where declarations are of the type
  // { name, type, expression, loc }
}

function TryCatchStatement(_try, _catch) {
  this.left = _try;
  this.right = _catch;
}

core.inherits(BlockStatement, core.Statement);
core.inherits(Identifier, core.Expression);
core.inherits(AssignmentStatement, core.Statement);
core.inherits(AssignmentBlock, core.Statement); // Changed from Expression?
core.inherits(TryCatchStatement, core.Statement);
