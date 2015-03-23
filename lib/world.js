var fs = require('fs')
  , path = require('path')
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
  this.mainModule = options.mainModule;
  this.compiling = {}; // map of filename -> true
  this.modules = {}; // map of filename -> ast.Module

  // Misc notes:
  //
  //   .modules EXCLUDES .mainModule
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
  candidates.push(path.dirname(fromModule.filename) + path.sep + to.join(path.sep) + '.vgl');

  // Look for lib
  if (this.options.libs.hasOwnProperty(to[0])) {
    candidates.push(this.options.libs[to[0]] + path.sep + to.slice(1).join(path.sep) + '.vgl');
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
        '. Looked in:\n  ' + candidates.join('\n  ')));
    }

    // Process the module before returning it
    this.compiling[filename] = true;
    this._processModule(new ast.Module(null, filename, src), function(err, m) {
      delete this.compiling[filename];
      if (err) {
        return callback(err);
      }

      importNode.ast = m;
      callback(undefined);
    }.bind(this));
  }.bind(this));
};

//
// Processes a model, loading imports.  When all importation is finished,
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
      parser(m);
    } catch (err) {
      err.world = this;
      err.src = m.src;
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
      return callback(node.error('Duplicated import'));
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
  this._processModule(this.mainModule, callback);
};
