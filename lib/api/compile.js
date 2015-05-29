var path = require('path')
  , World = require('../world')
  , ast = require('../ast')
  , passes = require('../passes')
  , convert = require('./convert')
  ;


module.exports = function compile(src, language, options, callback) {
  // Normalize options
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }
  if (!options) {
    options = {};
  }
  if (!options.filename) {
    options.filename = 'main';
  }
  if (!options.convert) {
    options.convert = {};
  }
  options.prune = !!options.prune;

  // Prep the world
  var mainModule = new ast.Module(null, options.filename, src);
  var world = new World({
    baseDir: path.dirname(options.filename),
    mainModule: mainModule,
    libs: options.libs
  });

  // Load up the world
  world.load(function(err) {
    if (err) {
      err.world = world;
      return callback(err);
    }

    // Run our passes on the world
    try {
      passes.runAll(world); // TODO - Prune
    } catch (err) {
      err.world = world;
      return callback(err);
    }

    // Convert to a filemap safely
    var filemap = null;
    try {
      filemap = convert(world, language, options.convert);
    } catch (e) {
      e.world = world;
      return callback(e);
    }

    return callback(undefined, filemap, world);
  });
};
