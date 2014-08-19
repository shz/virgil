var async = require('async')
  , scope = require('../scope')
  , types = require('../types')
  , ast = require('../ast')
  , World = require('../world')
  ;

exports.runAll = function(thing) {
  // Build scope information and attach to the ast nodes
  scope.build(thing, true);

  // Calculate type information
  types.realize(thing);
};
