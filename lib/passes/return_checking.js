var ast = require('../ast')
  , types = require('../types')
  ;

//
// Performs three types of checks:
//
//  * Ensures callables with non-void return types actually have
//    return statements.
//  * Ensures types of return statements match callable return type
//  * TODO Ensures callables with non-void return types have a return
//    statement for every logic path.
//

var check = function(node) {
  var type = node.returnType;
  var body = node.body;

  var count = 0;
  ast.traverse(body, function(node) {
    if (node instanceof ast.ReturnStatement) {
      count++;

      if (!types.equal(node.type, type))
        throw new Error('This');
    }
  });
};

module.exports = function(root) {
  var stack = [];
  var cur = null;

  ast.traverse(root, function(node) {
    // Skip things in extern nodes
    if (node instanceof ast.ExternStatement)
      return false;

    if (node instanceof ast.FunctionStatement
    ||  node instanceof ast.MethodStatement
    ||  node instanceof ast.LambdaExpression) {
      cur = {
        type: node.returnType,
        name: node.constructor.name.replace('Statement', '') + (node.name ? (' ' + node.name) : ''),
        count: 0
      };
      stack.push(cur);
    } else if (node instanceof ast.ReturnStatement) {
      cur.count++;

      // Special case; allow null for user-defined types, strs, and lists
      if (node.type == types.canned['null'] &&
      (!cur.type.builtin || cur.type.name == 'list' || cur.type.name == 'str'))
        return;

      if (!types.generics.matches(node.type, cur.type))
        throw new Error(cur.name + ' has a return type of ' + cur.type.toString() +
          ' but is attempting to return ' + node.type.toString());
    }
  }, function(node) {
    if (node instanceof ast.FunctionStatement
    ||  node instanceof ast.MethodStatement
    ||  node instanceof ast.LambdaExpression) {
      if (!types.equal(types.canned['void'], cur.type) && cur.count == 0)
        throw new Error(cur.name + ' has a non-void return type, but' +
          ' has no return statements in it');

      stack.pop();
      cur = stack[stack.length - 1];
    }
  });
};
