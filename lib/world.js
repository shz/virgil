var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , parser = require('./parser')
  , ast = require('./ast')
  ;

var relativePath = function(m) {

};

var findFilename = function(base, choices, callback) {
  var i=-1;
  var attempt = function() {
    if (++i == choices.length) {
      return callback(new Error('Unable to find any files'));
    }

    var f = path.join(base, choices[i]);
    fs.stat(f, function(err, stat) {
      if (err || !stat.isFile()) {
        return attempt();
      }

      return callback(undefined, choices[i]);
    });
  };
  attempt();
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

    w.parse(baseDir, name, toImport[name], function(err, m) {
      if (err) return callback(err);

      toImport[name].filename = m.path;
      callback(undefined, m);
    });
  }, callback);
};

var World = module.exports = function(entry, options) {
  this.debug = !!(options || {}).debug;
  this.libs = (options || {}).libs || [];
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

  // Generate an ordered list of places to look for our file
  var fileAttempts = [this.toFilename(root || this.base, moduleName)];
  this.libs.forEach(function(l) {
    fileAttempts.push(this.toFilename(l, moduleName));
  }.bind(this));

  findFilename(this.base, fileAttempts, function(err, filename) {
    if (err) {
      // We want to put the filename in the error message...
      var message = 'Unable to find module ' + moduleName;
      if (this.debug || true) {
        message += ' (Looked in ' + fileAttempts.join('; ') + ')';
      }
      err = new Error(message);

      if (importNode) {
        err.start = importNode.loc.start;
        err.end = importNode.loc.end;
        err.filename = importNode.filename;
      }
      return callback(err);
    }

    if (this.modules[filename]) {
      if (importNode && !importNode.ast) {
        importNode.ast = this.modules[filename];
      }
      return callback(undefined, this.modules[filename]);
    }

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

      this.parseString(src, filename, function(err, m) {
        if (err) return callback(err);

        if (importNode && !importNode.ast) {
          importNode.ast = m;
        }
        callback(undefined);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

World.prototype.parseString = function(src, filename, callback) {
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
    callback(undefined, m);
  }.bind(this));
};
