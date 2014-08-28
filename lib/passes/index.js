var passes = [ require('./method_naturality')
             , require('./generics')
             , require('./type_check')
             , require('./immutability')
             ];

var scope = require('../scope')
  , types = require('../types')
  , ast = require('../ast')
  , World = require('../world')
  , imports = require('./imports')
  ;

var run = function(node) {
  // Build scope information and attach to the ast nodes
  scope.build(node, true);

  // Calculate type information
  types.realize(node);

  // Run all other passes
  passes.forEach(function(f) {
    f(node);
  });
};

exports.runAll = function(thing) {
  if (thing instanceof World) {
    imports(thing);

    Object.keys(thing.modules).forEach(function(k) {
      try {
        run(thing.modules[k]);
      } catch (err) {
        err.filename = k;
        err.src = thing.src[k];
        throw err;
      }
    });
  } else {
    run(thing);
  }
};
