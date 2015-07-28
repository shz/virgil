var ast = require('../../ast');

exports.statement = function(node) {
  switch (node.constructor) {
    case ast.ImportStatement:
    case ast.ExternStatement:
    case ast.IfStatement:
    case ast.BlockStatement:
    case ast.FunctionStatement:
    case ast.ReturnStatement:
    case ast.AssignmentStatement:
    case ast.VariableDeclaration:
    case ast.OutVariableDeclaration:
    case ast.MutableVariableDeclaration:
    case ast.AssignmentBlock:
    case ast.MethodStatement:
    case ast.StructStatement:
    case ast.WhileStatement:
    case ast.TryCatchStatement:
    case ast.ForStatement:
    case ast.ContinueStatement:
    case ast.BreakStatement:

    default:
      node.throw('Don\'t know how to convert ' + node.constructor.name);
  }
};
