var async = require('async')
  , scope = require('../scope')
  , types = require('../types')
  , ast = require('../ast')
  , World = require('../world')
  ;

var run = function(n) {
  // Build scope information and attach to the ast nodes
  scope.build(n, true);

  // Calculate type information
  types.realize(n);
};

exports.runAll = function(thing) {
  if (thing instanceof World) {
    // TODO - Run a pass realizing imports

    Object.keys(thing.modules).forEach(function(k) {
      run(thing.modules[k]);
    });
  } else {
    run(thing);
  }
};
