module.exports = function convert(world, language, options) {
  if (language != 'javascript2') {
    throw new Error('Converter ' + language + ' not supported via this API');
  }
  if (!(world instanceof exports.ast.World)) {
    throw new Error('First argument must be a World, got a ' + world.constructor.name + ' instead');
  }


  var converter = new (exports.converters[language])(options || {});
  var filemap = {};
  var merge = function(n) {
    Object.keys(n).forEach(function(k) {
      if (filemap.hasOwnProperty(k)) {
        throw new Error('Output file ' + k + ' was defined by another module');
      }
      filemap[k] = n[k];
    });
  };

  // Process everything but the root module
  Object.keys(world.modules).forEach(function(m) {
    if (m == moduleFilename) { // TODO - Where does this come from?
      return;
    }
    merge(converter.compile(world.modules[m]));
  });
  // And then do the root module, last
  merge(converter.compile(world.modules[moduleFilename]));

  // TODO - Normalize paths to exclude lib paths

  // Do the final postprocess and call it a day
  return converter.postProcess(filemap);
};
