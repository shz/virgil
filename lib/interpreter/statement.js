//
// Executes Virgil statements of all kinds.
//

var ast = require('../ast')
  , SlotStack = require('./slot_stack')
  , Slot = require('./slot')
  , flow = require('./flow')
  ;

// Lazy imported to avoid circular dependencies
var executeExpression = null;
var executeBlock = null;

var executeStatement = module.exports = function statement(node, slots) {
  if (!executeExpression) {
    executeExpression = require('./expression');
    executeBlock = require('./block');
  }

  if (!slots) {
    slots = new SlotStack();
  }

  switch (node.constructor) {
    case ast.ReturnStatement:
      return flow.RETURN(executeExpression(node.expression, slots));

    case ast.VariableDeclaration:
      var val = executeExpression(node.expression, slots);
      slots.create(node.name, val, true, node.type);
      break;
    case ast.MutableVariableDeclaration:
      var val = executeExpression(node.expression, slots);
      slots.create(node.name, val, false, node.type);
      break;

    case ast.IfStatement:
      var val = Slot.wrap(executeExpression(node.condition, slots)).value;
      if (val.constructor == ast.TrueLiteral) {
        var result = executeBlock(node.left, slots);
        if (result) {
          return result;
        }
      } else if (node.right) {
        var result = executeBlock(node.right, slots);
        if (result) {
          return result;
        }
      }

    default:
      node.throw('Don\'t know how to execute statement ' + node.constructor.name);
  }
};
