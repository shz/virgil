var World = require('../world')
  , converters = require('../converters')
  ;

//
// Converts a world to a filemap in the given language
//
module.exports = function convert(world, language, options) {
  if (!(world instanceof World)) {
    throw new Error('First argument must be a World, got a ' + world.constructor.name + ' instead');
  }
  if (!converters[language]) {
    throw new Error('No converter to language' + language);
  }
  if (!options) {
    options = {};
  }

  options.baseDir = world.baseDir;

  var converter = new (converters[language])(options);
  var filemap = {};
  var merge = function(m) {
    var files = null;
    try {
      files = converter.compile(m);
    } catch (err) {
      err.src = m.src;
      err.filename = m.filename;
      throw err;
    }
    Object.keys(files).forEach(function(k) {
      filemap[k] = files[k];
    });
  };

  // Compile every module
  Object.keys(world.modules).forEach(function(m) {
    merge(world.modules[m]);
  });

  // Do the final postprocess and call it a day
  return converter.postProcess(filemap);
};
