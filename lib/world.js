var fs = require('fs')
  , parser = require('./parser')
  ;

var World = module.exports = function() {
  this.compiling = {};
  this.modules = {};
};

World.prototype.toFilename = function(moduleName) {
  return moduleName.replace(/\./g, '/') + '.vgl';
};

World.prototype.parse = function(moduleName, callback) {
  var filename = this.toFilename(moduleName);

  if (this.modules[filename]) {
    return process.nextTick(function() {
      callback(undefined, this.modules[filename]);
    }.bind(this));
  }

  if (this.compiling[filename])
    throw new Error('Circular import for ' + moduleName);


  this.compiling[filename] = true;
  fs.readFile(filename, {encoding: 'utf8'}, function(err, src) {
    if (err) return callback(err);

    this.compiling[filename] = false;
    this.modules[filename] = parser.module(src, filename);
    callback(undefined);
  }.bind(this));
};


World.prototype.parseString = function(src, filename, callback) {
  try {
    if (this.modules[filename])
      return this.modules[filename];

    if (this.compiling[filename])
      throw new Error('Circular import for ' + moduleName);

    this.modules[filename] = parser.module(src, filename);
  } catch (err) {

  }
};
