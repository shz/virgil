//
// Executes Virgil statements of all kinds.
//

var ast = require('../ast')
  , SlotStack = require('./slot_stack')
  , Slot = require('./slot')
  , flow = require('./flow')
  , findSlot = require('./find_slot')
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
    case ast.ContinueStatement:
      return flow.CONTINUE();
    case ast.BreakStatement:
      return flow.BREAK();

    case ast.VariableDeclaration:
      var val = executeExpression(node.expression, slots);
      slots.create(node.name, val, node.type, true);
      break;
    case ast.MutableVariableDeclaration:
      var val = executeExpression(node.expression, slots);
      slots.create(node.name, val, node.type, false);
      break;

    case ast.AssignmentStatement:
      var storage = findSlot(node.left, slots);
      var val = executeExpression(node.right, slots);
      storage.assign(val);
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
      break;

    case ast.WhileStatement:
      while (true) {
        if (Slot.wrap(executeExpression(node.expression, slots)).value.constructor != ast.TrueLiteral) {
          break;
        }

        var result = executeBlock(node.body, slots);
        if (result) {
          if (result.type == 'return') {
            return result;
          } else if (result.type == 'continue') {
            continue;
          } else if (result.type == 'break') {
            break;
          }
        }
      }
      break;

    case ast.ForStatement:
      var decl = node.declaration;
      var cur = executeExpression(decl.expression, slots).value;
      var end = executeExpression(node.end, slots).value;

      while (true) {
        if (cur == end) {
          break;
        }

        var result = executeBlock(node.body, slots, [[decl.name, new ast.IntegerLiteral(cur)]]);
        if (result) {
          if (result.type == 'return') {
            return result;
          } else if (result.type == 'continue') {
            continue;
          } else if (result.type == 'break') {
            break;
          }
        }

        if (node.up) {
          cur++;
        } else {
          cur--;
        }
      }
      break;

    default:
      node.throw('Don\'t know how to execute statement ' + node.constructor.name);
  }
};
