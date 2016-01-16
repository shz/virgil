var path = require('path')
  , World = require('../world')
  , ast = require('../ast')
  , passes = require('../passes')
  , convert = require('./convert')
  , analyze = require('./analyze')
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
  analyze(mainModule, {libs: options.libs, baseDir: path.dirname(options.filename)}, function(err, world) {
    if (err) {
      return callback(err, {}, world);
    }

    // TODO - Prune if set

    // Convert to a filemap
    var filemap = null;
    try {
      filemap = convert(world, language, options.convert);
    } catch (e) {
      e.world = world;
      return callback(e, {}, world);
    }

    return callback(undefined, filemap, world);
  });
};
