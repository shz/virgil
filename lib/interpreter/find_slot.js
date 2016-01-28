//
// Looks up the slot for the given node, which may be either an Identifier
// or a PropertyAccess.
//

var ast = require('../ast')
  , executeExpression = require('./expression')
  , Slot = require('./slot')
  ;

module.exports = function(node, slots) {
  if (node instanceof Slot) {
    return node;
  } else if (node instanceof ast.Identifier) {
    return slots.find(node.name);
  } else if (node instanceof ast.PropertyAccessExpression) {
    return executeExpression(node.left, slots)[node.right.name];
  } else {
    node.throw('Cannot look up slot for ' + node.constructor.name);
  }
};
