var ast = require('../ast')
  , SlotStack = require('./slot_stack')
  , executeExpression = require('./expression')
  , executeStatement = require('./statement')
  ;

var run = module.exports = function(module, entryPoint) {
  var defScope = module.body.scope.search('function', entryPoint);

  if (!defScope) {
    throw new Error('Unable to find entry point ' + entryPoint + ' in module');
  }

  var f = defScope.functions[entryPoint];
  executeBlock(f.body);
};

//
// Executes a block, handling slot stacks, arguments, and everything
// else needed.
//
var executeBlock = function(node, slots, args) {
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
  node.body.forEach(function(node) {
    if (node instanceof ast.Expression) {
      executeExpression(node, slots);
    } else if (node instanceof ast.Statement) {
      executeStatement(node, slots);
    } else {
      throw new Error('Don\'t know how to handle a ' + node.constructor.name);
    }
  });
};
