var scope = require('../scope');

exports.runAll = function(node) {
  // Build scope information and attach to the ast nodes
  scope.build(node, true);
};
