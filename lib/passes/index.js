var scope = require('../scope')
  , types = require('../types')
  ;

exports.runAll = function(node) {
  // Build scope information and attach to the ast nodes
  scope.build(node, true);

  // Calculate type information
  types.realize(node);
};