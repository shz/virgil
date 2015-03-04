//
// Executes Virgil statements of all kinds.
//

var ast = require('../ast')
  , SlotStack = require('./slot_stack')
  , flow = require('./flow')
  ;

// Lazy imported to avoid circular dependencies
var executeExpression = null;

var executeStatement = module.exports = function statement(node, slots) {
  if (!executeExpression) {
    executeExpression = require('./expression');
  }

  if (!slots) {
    slots = new SlotStack();
  }

  switch (node.constructor) {
    case ast.ReturnStatement:
      return flow.RETURN(executeExpression(node.expression));

    case ast.FunctionCallExpression:
      // TODO
    default:
      node.throw('Don\'t know how to execute statement ' + node.constructor.name);
  }
};
