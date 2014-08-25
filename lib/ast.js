var inherit = function(Child, Parent) {
  Child.prototype = new Parent();
  Child.prototype.constructor = Child;

  // Kind of a kludge, but...
  exports[Child.name] = Child;
};

function Module(body, path) {
  this.body = body;
  this.path = path;
}
Module.prototype.repr = function() {
  var s = 'Module: ' + this.name;
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
    s += ': ' + this.name.toString();

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
function NullLiteral() {}

inherit(NumericLiteral, Expression);
inherit(StringLiteral, Expression);
inherit(IntegerLiteral, NumericLiteral);
inherit(FloatLiteral, NumericLiteral);
inherit(TrueLiteral, Expression);
inherit(FalseLiteral, Expression);
inherit(NullLiteral, Expression);

// Arithmetic

function MultiplicationExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function AdditionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function SubtractionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function DivisionExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function PowerExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function ModExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
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

  this.loc = {
    start: this.condition.loc.start,
    end: this.right.loc.end
  };
}

function EqualsExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function GreaterThanExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LessThanExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LogicalOrExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function LogicalAndExpression(left, right) {
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.left.loc.start,
    end: this.right.loc.end
  };
}

function IfStatement(condition, left, right) {
  this.condition = condition;
  this.left = left;
  this.right = right;

  this.loc = {
    start: this.condition.loc.start,
    end: this.right ? this.right.loc.end : this.left.loc.end
  };
}

inherit(GreaterThanExpression, Expression);
inherit(LessThanExpression, Expression);
inherit(EqualsExpression, Expression);
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
  this.importedFrom = null;
}

function MethodStatement(name, args, returnType, body, ex) {
  this.name = name;
  this.args = args;
  this.type = returnType;
  this.body = body;
  this.ex = !!ex;
  this.nat = false;
  this.importedFrom = null;
}

function ReturnStatement(expression) {
  this.expression = expression;
}

function LambdaExpression(args, body) {
  this.args = args;
  this.body = body;
}

function FunctionCallExpression(left, args) {
  this.args = args;
  this.left = left;
  this.type = null;
}

inherit(FunctionStatement, Statement);
inherit(MethodStatement, Statement);
inherit(ReturnStatement, Statement);
inherit(LambdaExpression, Expression);
inherit(FunctionCallExpression, Expression);

// Variable declarations

function VariableDeclaration(name, type, expression, override) {
  this.name = name;
  this.type = type;
  this.expression = expression;
  this.override = override;
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

// Lists

function ListAccessExpression(left, right) {
  this.left = left;
  this.right = right;
  this.computed = !(this.right instanceof IntegerLiteral);
}

function ListExpression(body) {
  this.body = body;
}

inherit(ListAccessExpression, Expression);
inherit(ListExpression, Expression);

// Modules

function ImportStatement(module) {
  this.module = module;
  this.ast = null;
}

function ExternStatement(structs, functions, methods, declarations) {
  this.structs = structs;
  this.functions = functions;
  this.methods = methods;
  this.declarations = declarations;
}

inherit(ImportStatement, Statement);
inherit(ExternStatement, Statement);

// Misc

function StructStatement(name, body, ex) {
  this.name = name;
  this.body = body;
  this.ex = !!ex;
  this.importedFrom = null;
}

function BlockStatement(statements) {
  this.body = statements;
}

function Identifier(name) {
  this.name = name;
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

inherit(StructStatement, Statement);
inherit(BlockStatement, Statement);
inherit(Identifier, Expression);
inherit(AssignmentStatement, Statement);
inherit(AssignmentBlock, Expression);
inherit(PropertyAccessExpression, Expression);
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
      case LessThanExpression:
      case GreaterThanExpression:
      case AssignmentStatement:
      case LogicalOrExpression:
      case LogicalAndExpression:
      case EqualsExpression:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case TernaryExpression:
      case IfStatement:
        traverse(node.condition, enter, exit);
        traverse(node.left, enter, exit);
        if (node.right)
          traverse(node.right, enter, exit);
        break;

      case FunctionStatement:
      case MethodStatement:
        if (node.body)
          traverse(node.body, enter, exit);
        break;

      case ReturnStatement:
        if (node.expression)
          traverse(node.expression, enter, exit);
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
        traverse(node.declaration, enter, exit);
        traverse(node.body, enter, exit);
        break;

      case BlockStatement:
      case ListExpression:
      case Module:
        traverse(node.body, enter, exit);
        break;

      case FunctionCallExpression:
        traverse(node.args, enter, exit);
        traverse(node.left, enter, exit);
        break;

      case ListAccessExpression:
      case PropertyAccessExpression:
      case TryCatchStatement:
        traverse(node.left, enter, exit);
        traverse(node.right, enter, exit);
        break;

      case LambdaExpression:
        traverse(node.body, enter, exit);
        break;

      case StructStatement:
        traverse(node.body, enter, exit);
        break;

      case AssignmentBlock:
        traverse(node.declarations, enter, exit);
        break;

      case ExternStatement:
        traverse(node.structs, enter, exit);
        traverse(node.methods, enter, exit);
        traverse(node.functions, enter, exit);
        traverse(node.declarations, enter, exit);
        break;

      case Identifier:
      case NullLiteral:
      case TrueLiteral:
      case FalseLiteral:
      case IntegerLiteral:
      case StringLiteral:
      case FloatLiteral:
      case BreakStatement:
      case ContinueStatement:
      case ImportStatement:
        break;

      default:
        var err = new Error('Don\'t know how to traverse ' + node.constructor.name);
        console.log(node);
        try {
          err.start = node.loc.start;
          err.end = node.loc.end;
        } catch (err) {}
        throw err;
    }
  }

  exit(node);
};
