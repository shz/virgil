var passes = [ require('./method_naturality')
             , require('./generics')
             , require('./type_check')
             , require('./immutability')
             , require('./return_checking')
             , require('./extern_classes')
             ];

var scope = require('../scope')
  , types = require('../types')
  , prune = require('./prune')
  , ast = require('../ast')
  , World = require('../world')
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

exports.runAll = function(thing, options) {
  if (thing instanceof World) {
    Object.keys(thing.modules).forEach(function(k) {
      try {
        run(thing.modules[k]);
      } catch (err) {
        err.filename = k;
        err.src = thing.src[k];
        throw err;
      }
    });

    if(options.prune) {
      prune(thing.modules, options.rootModule);
    }
  } else {
    run(thing);
  }
};

exports.list = passes;
