var inherit = function(Child, Parent) {
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  // Kind of a kludge, but...
  exports[Child.name] = Child;
};

function Module(body) {
  this.body = body;
}
Module.prototype.repr = function() {
  var s = 'Module';
  this.body.forEach(function(s) {
    s += '\n' + s.repr('  ');
  });
  return s;
};
Module.prototype.toString = function() {
  return this.repr();
};
exports.Module = Module;

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
  if (this.body) {
    if (this.body.length) {
      this.body.forEach(function(statement) {
        s += '\n' + statement.repr(indent + '  ');
      });
    } else if (this.body.body) {
      this.body.body.forEach(function(statement) {
        s += '\n' + statement.repr(indent + '  ');
      });
    }
  }

  return s;
};

Statement.prototype.toString = function() {
  return this.repr();
};
exports.Statement = Statement;

function Expression() {}
inherit(Expression, Statement);

// Literals

function NumericLiteral() {}
function StringLiteral(value) {
  this.value = value;
}

function IntegerLiteral(value) {
  this.value = parseInt(value, 10);
}

function FloatLiteral(value) {
  this.value = parseFloat(value);
}

function TrueLiteral() {}
function FalseLiteral() {}

inherit(NumericLiteral, Expression);
inherit(StringLiteral, Expression);
inherit(IntegerLiteral, NumericLiteral);
inherit(FloatLiteral, NumericLiteral);
inherit(TrueLiteral, Expression);
inherit(FalseLiteral, Expression);

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

inherit(TernaryExpression, Expression);
inherit(IfStatement, Statement);
inherit(LogicalAndExpression, Expression);
inherit(LogicalOrExpression, Expression);

// Functions

function FunctionStatement(name, args, returnType, body, ex) {
  this.name = name;
  this.args = args;
  this.type = returnType;
  this.body = body;
  this.ex = !!ex;
}

function MethodStatement(name, args, returnType, body, ex) {
  this.name = name;
  this.args = args;
  this.type = returnType;
  this.body = body;
  this.ex = !!ex;
}

function ReturnStatement(expression) {
  this.expression = expression;
}

function LambdaExpression(args, body) {
  this.args = args;
  this.body = body;
}

inherit(FunctionStatement, Statement);
inherit(MethodStatement, Statement);
inherit(ReturnStatement, Statement);
inherit(LambdaExpression, Expression);

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

// Loops

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

inherit(WhileStatement, Statement);
inherit(ForStatement, Statement);
inherit(BreakStatement, Statement);
inherit(ContinueStatement, Statement);

// Misc

function StructStatement(name, body, ex) {
  this.name = name;
  this.body = body;
  this.ex = !!ex;
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

function ListAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = !(this.right instanceof IntegerLiteral);
}

function ListExpression(body) {
  this.body = body;
}

function TryCatchStatement(_try, _catch) {
  this.left = _try;
  this.right = _catch;
}

inherit(StructStatement, Statement);
inherit(BlockStatement, Statement);
inherit(Identifier, Expression);
inherit(AssignmentStatement, Statement);
inherit(AssignmentBlock, Expression);
inherit(FunctionCallExpression, Expression);
inherit(PropertyAccessExpression, Expression);
inherit(ListAccessExpression, Expression);
inherit(ListExpression, Expression);
inherit(TryCatchStatement, Statement);

/* istanbul ignore next */
var traverse = exports.traverse = function(node, enter, exit) {
  if (!exit)
    exit = function() {};

  if (node instanceof Array) {
    for (var i=0; i<node.length; i++)
      traverse(node[i], enter ,exit);
    return;
  }

  var skip = enter(node) === false;

  if (!skip) {

    switch (node.constructor) {
      case MultiplicationExpression:
      case AdditionExpression:
      case SubtractionExpression:
      case DivisionExpression:
      case PowerExpression:
      case ModExpression:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case TernaryExpression:
      case IfStatement:
        traverse(node.condition);
      case LogicalOrExpression:
      case LogicalAndExpression:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case FunctionStatement:
      case MethodStatement:
        traverse(node.body, enter, exit);
        break;

      case VariableDeclaration:
      case MutableVariableDeclaration:
      case OutVariableDeclaration:
        traverse(node.expression, enter, exit);
        break;

      case WhileStatement:
        traverse(node.expression, enter, exit);
        traverse(node.body, enter, exit);
        break;
      case ForStatement:
        traverse(node.body, enter, exit);
        break;

      case BlockStatement:
      case ListExpression:
      case Module:
        for (var i=0; i<node.body.length; i++)
          traverse(node.body[i], enter, exit);
        break;

      case PropertyAccessExpression:
      case TryCatchStatement:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);

      default:
        // Pass
        break;
    }
  }

  exit(node);
};
