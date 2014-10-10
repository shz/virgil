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
      toImport[node.module.join('.')] = node;
    }
  });

  // We use series to enforce import order
  async.eachSeries(Object.keys(toImport), function(name, callback) {
    var baseDir = path.dirname(path.join(w.base, m.path));
    var filename = w.toFilename(baseDir, name);
    if (w.modules[filename])
      return callback();

    // Hack
    toImport[name].filename = m.path;
    w.parse(baseDir, name, toImport[name], callback);
  }, callback);
};

var World = module.exports = function(entry) {
  this.entry = entry;
  this.base = path.resolve(path.dirname(entry));
  this.compiling = {};
  this.modules = {};
  this.src = {};
};

// Makes filenames relative to the base
World.prototype.toFilename = function(from, moduleName) {
  var abs = path.resolve(path.join(from, moduleName.replace(/\./g, '/') + '.vgl'));
  return path.relative(this.base, abs);
};

World.prototype.parse = function(root, moduleName, importNode, callback) {
  if (typeof importNode == 'function') {
    callback = importNode;
    importNode = undefined;
  }
  var filename = this.toFilename(root || this.base, moduleName);

  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  if (this.compiling[filename]) {
    var err = new Error('Circular import for ' + filename);
    if (importNode) {
      err.start = importNode.loc.start;
      err.end = importNode.loc.end;
      err.filename = importNode.filename;
    }
    return callback(err);
  }

  this.compiling[filename] = true;
  fs.readFile(path.join(this.base, filename), {encoding: 'utf8'}, function(err, src) {
    if (err) {
      err.filename = filename;
      err.src = '';
      return callback(err);
    }

    this.parseString(src, filename, callback);
  }.bind(this));
};

World.prototype.parseString = function(src, filename, callback) {
  var filename = this.toFilename(this.base,
    path.relative(this.base, filename).replace(/\.vgl$/, '')
                                      .replace(/\/|\\/g, '.'));

  if (this.modules[filename])
    return callback(undefined, this.modules[filename]);

  this.src[filename] = src;
  var m = null;

  try {
    m = parser.module(src, filename);
  } catch (err) {
    err.filename = filename;
    err.src = src;
    return callback(err);
  }

  processImports(this, m, function(err) {
    if (err)
      return callback(err);

    delete this.compiling[filename];
    this.modules[filename] = m;
    callback();
  }.bind(this));
};
