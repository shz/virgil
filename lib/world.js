var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , parser = require('./parser')
  , ast = require('./ast')
  ;

var relativePath = function(m) {

};

var processImports = function(w, m, callback) {
  var toImport = {};

  ast.traverse(m, function(node) {
    if (node.constructor == ast.ImportStatement) {
      toImport[node.module.join('.')] = true;
    }
  });

  async.each(Object.keys(toImport), function(name, callback) {
    var baseDir = path.dirname(path.join(w.base, m.path));
    var filename = w.toFilename(baseDir, name);
    if (w.modules[filename] || w.compiling[filename])
      return callback();

    w.parse(baseDir, name, callback);
  }, callback);
};

var World = module.exports = function(entry) {
  this.entry = entry;
  this.base = path.resolve(path.dirname(entry));
  this.compiling = {};
  this.modules = {};
};

// Makes filenames relative to the base
World.prototype.toFilename = function(from, moduleName) {
  var abs = path.resolve(path.join(from, moduleName.replace(/\./g, '/') + '.vgl'));
  return path.relative(this.base, abs);
};

World.prototype.parse = function(root, moduleName, callback) {
  var filename = this.toFilename(root || this.base, moduleName);

  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  if (this.compiling[filename])
    return callback(new Error('Circular import for ' + filename));

  this.compiling[filename] = true;
  fs.readFile(path.join(this.base, filename), {encoding: 'utf8'}, function(err, src) {
    if (err) return callback(err);

    this.parseString(src, filename, callback);
  }.bind(this));
};

World.prototype.parseString = function(src, filename, callback) {
  filename = this.toFilename(this.base,
    path.relative(this.base, filename).replace(/\.vgl$/, '')
                                      .replace(/\/|\\/g, '.'));

  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  try {
    var m = parser.module(src, filename);
    delete this.compiling[filename];
    this.modules[filename] = m;
    processImports(this, m, callback);
  } catch (err) {
    return callback(err);
  }
};
