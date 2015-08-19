var fs = require('fs'); // Must be own statement for brfs workaround
var path = require('path')
  , async = require('async')
  , ast = require('./ast')
  , parser = require('./parser')
  ;

//
// A world encompasses a view of a compiling module; essentially a
// set of files, but with some optional information like lib directories.
// Once set up, it's kicked off with the .load() method and it'll hunt
// down and process any imported modules.
//
var World = module.exports = function(options) {
  options = options || {};
  if (!options.baseDir) {
    throw new Error('Must supply options.baseDir');
  }
  if (!options.mainModule) {
    throw new Error('Must supply options.mainModule');
  }
  if (!options.libs) {
    options.libs = {};
  }

  this.options = options;
  this.baseDir = options.baseDir;
  this.mainModule = options.mainModule; // ast.Module
  this.compiling = {}; // map of filename -> true
  this.modules = {}; // map of filename -> ast.Module
  this.libs = {};

  // Ensure basedir always ends with a slash
  if (this.baseDir[this.baseDir.length - 1] != path.sep) {
    this.baseDir += path.sep;
  }

  for (var i in options.libs) /* istanbul ignore else */ if (options.libs.hasOwnProperty(i)) {
    this.libs[i] = path.resolve(options.libs[i]);
  }
};

//
// Given an originating module and an import target, gets the
// associated module.  Or fails, if it can't figure out how to import.
//
// This memoizes; if the world has already loaded the module, it's
// just sent back.
//
World.prototype._loadImport = function(fromModule, importNode, callback) {
  var candidates = [];
  var to = importNode.module;

  // Search for local first
  var target = path.dirname(fromModule.filename) + path.sep + to.join(path.sep) + '.vgl';
  if (target.indexOf(this.baseDir) == 0) {
    target = target.substr(this.baseDir.length);
  }
  candidates.push(path.resolve(this.baseDir, target));

  // Look for lib
  if (this.libs.hasOwnProperty(to[0])) {
    candidates.push(this.libs[to[0]] + path.sep + to.slice(1).join(path.sep) + '.vgl');
  }

  // If a module with the filename is already compiling, it's a circular
  // import and we need to throw an exception.  Or, if we already have a
  // module loaded at one of these paths, use that.
  var self = this;
  for (var i=0; i<candidates.length; i++) {
    if (self.compiling[candidates[i]]) {
      return process.nextTick(function() {
        var err = importNode.error('Circular import')
        err.world = self;
        err.src = fromModule.src;
        callback(err);
      });
    } else if (self.modules[candidates[i]]) {
      return (function(i) {
        importNode.ast = self.modules[candidates[i]];
        process.nextTick(function() {
          callback(undefined, self.modules[candidates[i]]);
        });
      })(i);
    }
  }

  // Otherwise, attempt to load the import's source by walking the
  // list of candidates.
  var src = null;
  var base = this.baseDir;
  async.detectSeries(candidates, function(filename, callback) {
    fs.readFile(filename, {encoding: 'utf8'}, function(err, data) {
      if (err) {
        return callback(false);
      }

      src = data;
      callback(true);
    });
  }, function(filename) {
    if (!filename) {
      return callback(importNode.error('Unable to import ' + importNode.module.join('.') +
        '. Looked for:\n  ' + candidates.join('\n  ')));
    }

    // Bootstrap the module
    this.compiling[filename] = true;
    var m = new ast.Module(null, filename, src);

    // Check if the module came from a lib, and stamp it if so
    for (var i in this.libs) /* istanbul ignore else */ if (this.libs.hasOwnProperty(i)) {
      if (filename.indexOf(this.libs[i]) === 0) {
        m.lib = {
          name: i,
          importPath: (fromModule.lib ? [fromModule.lib.name] : []).concat(to)
        };
        break;
      }
    }

    // Process the module before returning it
    this._processModule(m, function(err, m) {
      if (err) {
        return callback(err);
      }

      delete this.compiling[filename];
      importNode.ast = m;
      callback(undefined, m);
    }.bind(this));
  }.bind(this));
};

//
// Processes a module, loading imports.  When all importation is finished,
// sets this.modules[m.filename] = m.
//
World.prototype._processModule = function(m, callback) {
  // Parse the module ourselves if the body is missing
  if (!m.body) {
    if (!m.src) {
      return process.nextTick(function() {
        callback(new Error('Module is missing AST and source, which makes it kinda hard to compile'));
      });
    }

    try {
      parser(m, this.options.allowBare);
    } catch (err) {
      err.world = this;
      err.src = m.src;
      if (!err.filename) {
        err.filename = m.filename;
      }
      return process.nextTick(function() { callback(err) });
    }
  }

  // Process import nodes
  var imports = [];
  ast.traverse(m.body, function(node) {
    if (node instanceof ast.ImportStatement) {
      imports.push(node);
    }
  });

  // Check for duplicate imports
  var duplicateChecker = {};
  for (var i=0; i<imports.length; i++) {
    var key = imports[i].module.join('.');
    if (duplicateChecker.hasOwnProperty(key)) {
      var err = imports[i].error('Duplicate import');
      err.world = this;
      err.src = m.src;
      return callback(err);
    } else {
      duplicateChecker[key] = true;
    }
  }

  // Depth-first import loading
  async.eachSeries(imports, function(imp, callback) {
    this._loadImport(m, imp, callback);
  }.bind(this), function(err) {
    if (err) {
      return callback(err);
    }

    this.modules[m.filename] = m;
    callback(undefined, m);
  }.bind(this));
};

//
// Loads the world's contents.  This will recursively walk each module,
// starting with the entry module, and load all imports.
//
World.prototype.load = function(callback) {
  this.compiling[this.mainModule.filename] = true;
  this._processModule(this.mainModule, function(err) {
    if (!err) {
      this.compiling[this.mainModule.filename] = false;
    }

    callback.apply(null, arguments);
  }.bind(this));
};
