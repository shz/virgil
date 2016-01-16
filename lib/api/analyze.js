var path = require('path')
  , World = require('../world')
  , ast = require('../ast')
  , passes = require('../passes')
  , convert = require('./convert')
  ;


module.exports = function analyze(mod, options, callback) {
  // Normalize options
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  if (!options) {
    options = {};
  }

  // Prep the world
  var world = new World({
    baseDir: options.baseDir || path.dirname(mod.filename || ''),
    mainModule: mod,
    libs: options.libs
  });

  // Load up the world
  world.load(function(err) {
    if (err) {
      if (!err.world || !err.src || !err.filename) {
        console.warn('Error is missing debug info!');
        console.trace();
      }

      if (!err.world) {
        err.world = world;
      }
      if (!err.src) {
        err.src = src
      }
      if (!err.filename) {
        err.filename = options.filename;
      }
      return callback(err, world);
    }

    // Run our passes on the world
    try {
      passes.runAll(world);
    } catch (err) {
      err.world = world;
      return callback(err, world);
    }

    // Pass it along
    return callback(undefined, world);
  });
};
