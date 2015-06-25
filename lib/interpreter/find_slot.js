//
// Looks up the slot for the given node, which may be either an Identifier
// or a PropertyAccess.
//

var ast = require('../ast');

module.exports = function(node, slots) {
  if (node instanceof ast.Identifier) {
    return slots.find(node.name);
  } else {
    node.throw('Cannot look up slot for ' + node.constructor.name);
  }
};
