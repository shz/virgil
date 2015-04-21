var path = require('path');

module.exports = function postProcess(filemap) {
  var map = filemap;

  if (this.needDateTime) {
    map[path.join('.', 'virgil', 'datetime.js')] = this.libs.datetime;
  }

  // TODO
  if (this.options.browserify) {
    map = {};
  }

  return map;
};
