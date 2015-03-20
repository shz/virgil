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
  this.compiling = {}; // map of filename -> true
  this.modules = {}; // map of filename -> ast.Module
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
  candidates.push(fromModule.path + path.sep + to.join(path.sep) + '.vgl');

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
        process.nextTick(function() {
          callback(undefined, self.modules[candidates[i]]);
        });
      })(i);
    }
  }

  // Otherwise, attempt to load the candidates.  Once we've loaded,
  // process the module and move on.

  // TODO - _processModule
};

World.prototype._processModule = function(m, callback) {
  // Parse the module ourselves if the body is missing
  if (!m.body) {
    if (!m.src) {
      return process.nextTick(function() {
        callback(new Error('Module is missing AST and source, which makes it kinda hard to compile'));
      });
    }

    try {
      m = parser(m.src, m.filename);
    } catch (err) {
      err.world = this;
      err.src = m.src;
      return process.nextTick(function() { callback(err) });
    }
  }

  // Process import nodes
  var imports = [];
  ast.traverse(m.body, function(node) {
    if (!(node instanceof ast.ImportNode)) {
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
  async.eachSeries(imports, function(import, callback) {
    this._loadImport(m, import.module, callback);
  }.bind(this), callback);
};

//
// Loads the world's contents.  This will recursively walk each module,
// starting with the entry module, and load all imports.
//
World.prototype.load = function(callback) {
  this._processModule(this.mainModule, callback);
};
