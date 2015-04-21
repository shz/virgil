var browserifyMini = require('./browserify_mini');

module.exports = function postProcess(filemap, world) {
  var map = filemap;

  if (this.options.browserify) {
    var filename = world.mainModule.filename.match(/([\w\-\s]+)(\.vgl)?$/);
    if (filename) {
      filename = filename[1] + '.js';
    } else {
      filename = 'all.js';
    }
    map = {};
    var src = browserifyMini(filemap, filename);
    if (this.options.namespace) {
      src = 'this["' + this.options.namespace + '"] = ' + src;
    }
    map[filename] = src;
  }

  return map;
};
