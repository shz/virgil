var ast = require('../ast')
  , executeExpression = require('./expression')
  , executeStatement = require('./statement')
  , SlotStack = require('./slot_stack')
  ;

//
// Executes a block, handling slot stacks, arguments, and everything
// else needed.
//
// Don't create a new slot before calling; executeBlock will do that
// on its own.  If you need to pass in locals into the block, use the
// args array.
//
module.exports = function block(node, slots, args) {
  if (!(node instanceof ast.BlockStatement)) {
    throw new Error('May only execute on a BlockStatement');
  }
  if (!slots) {
    slots = new SlotStack();
  }
  if (!args) {
    args = [];
  }

  // Create a new slot list for this scope
  slots.push();

  // Set up initial args for this block
  args.forEach(function(a) {
    slots.set(a[0], a[1], true); // Immutable
  });

  // Process each statement in the block's body
  for (var i=0; i<node.body.length; i++) {
    var n = node.body[i];

    if (n instanceof ast.Expression) {
      executeExpression(n, slots);
    } else if (n instanceof ast.Statement) {
      var result = executeStatement(n, slots);
      if (result) {
        return result;
      }
    } else {
      n.throw('Don\'t know how to handle a ' + n.constructor.name);
    }
  }
};
