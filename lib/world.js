var fs = require('fs')
  , async = require('async')
  , parser = require('./parser')
  , ast = require('./ast')
  ;

var processImports = function(w, m, callback) {
  var toImport = {};

  ast.traverse(m, function(node) {
    if (node.constructor == ast.ImportStatement) {
      toImport[module] = true;
    }
  });

  async.each(Object.keys(toImport), function(m, callback) {
    var filename = w.toFilename(m);
    if (w.modules[filename] || w.compiling[filename])
      return callback();

    w.parse(m, callback);
  }, callback);
};

var World = module.exports = function() {
  this.compiling = {};
  this.modules = {};
};

World.prototype.toFilename = function(moduleName) {
  return moduleName.replace(/\./g, '/') + '.vgl';
};

World.prototype.parse = function(moduleName, callback) {
  var filename = this.toFilename(moduleName);

  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  if (this.compiling[filename])
    return callback(new Error('Circular import for ' + moduleName));

  this.compiling[filename] = true;
  fs.readFile(filename, {encoding: 'utf8'}, function(err, src) {
    if (err) return callback(err);

    this.parseString(src, filename, callback);
  }.bind(this));
};

World.prototype.parseString = function(src, filename, callback) {
  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  if (this.compiling[filename])
    return callback(new Error('Circular import for ' + moduleName));

  try {
    var m = parser.module(src, filename);
    delete this.compiling[filename];
    this.modules[filename] = m;
    processImports(this, m, callback);
  } catch (err) {
    return callback(err);
  }
};
