//
// The basic algorithm: walk require()s recursively.  Each time we see
// a new require, we add that to an array and rewrite all require()s
// to that module to use the index into the array.  This ensures the
// array is ordered correctly to resolve dependnecies (unless there's a
// circular require in which case we'll bail).
//

var path = require('path');

var Walker = function(filemap) {
  this.filemap = filemap;
  this.reqmap = {};
  this.active = {};
  this.order = [];
};
Walker.prototype.walk = function(filename, parent) {
  if (this.active[filename]) {
    throw new Error('Circular dependency between ' + filename + ' and ' + parent);
  }
  if (this.filemap[filename] === undefined) {
    throw new Error('Attempting to walk ' + filename + ' which is not in the filemap');
  }

  this.active[filename] = true;
  var spec = { filename: filename, src: '' };
  this.order.push(spec); // Push must happen before walk
  spec.src = this.filemap[filename].replace(/require\(['"](.*?)['"]\)/g, function(m, p) {
    var fullPath = path.normalize(path.join(path.dirname(filename), p));

    if (this.reqmap[fullPath] === undefined) {
      this.reqmap[fullPath] = this.order.length;
      this.walk(fullPath, filename);
    }

    return 'modules[' + this.reqmap[fullPath] + ']';
  }.bind(this));
  this.active[filename] = false;
};

Walker.prototype.collapse = function(entry) {
  this.walk(entry);
  this.order.reverse();

  var src = '(function() {\n';
  src += 'var modules = new Array(' + this.order.length + ');\n';
  src += '\n';
  this.order.forEach(function(file) {
    var i = this.reqmap[file.filename] || 0;
    var module = 'modules[' + i + '] = (function(exports) {\n';
    module += file.src + '\n';
    module += 'return exports;\n';
    module += '})({});\n';
    src += '//\n// ' + i + '\n// ' + file.filename + '\n//\n' + module + '\n\n';
  }, this);
  src += 'return modules[0];\n\n';
  src += '}).call(this);';

  return src;
};

module.exports = function(filemap, entry) {
  var w = new Walker(filemap);
  return w.collapse(entry);
};
