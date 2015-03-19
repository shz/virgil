module.exports = function postProcess(filemap) {
  var map = filemap;

  if (this.options.browserify) {
    map = {};
  }

  return map;
};
