var path = require('path');

//
// This file implements the module importing/referencing strategy.
//
// The basic approach: use require() to bring in imports.  We'll
// create a special global with a reserved name, and store a mapping
// from module path -> reserved name.  Then, whenever the module
// needs to be referenced, we'll look up the reserved name by the
// imported module's path.
//
// This is all handled on a per module (i.e. virgil file) basis.
//

exports.getDeclarationForImport = function(imp) {
  if (!this._moduleNames) {
    this._moduleNames = {};
  }

  var name = '$m_' + imp.module.join('_');
  this._moduleNames[imp.ast.filename] = name;

  var requirePath = null;
  if (imp.ast.lib) {
    var outpuPath;
    if (this.currentModule.lib) {
      outputPath = path.dirname(path.join.apply(path, this.currentModule.lib.importPath));
    } else {
      // Find the OUTPUT path for the module that is DOING the importing
      outputPath = path.dirname(path.relative(this.baseDir, this.currentModule.filename));
    }
    requirePath = path.relative(outputPath, path.join.apply(path, imp.ast.lib.importPath));
  } else {
    requirePath = imp.module.join('/');
  }
  requirePath += '.js';

  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.getIdentifierForModule(imp.ast),
      init: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'Literal',
          value: './' + requirePath,
          raw: './' + requirePath
        }]
      }
    }]
  };
};
exports.getIdentifierForModule = function(m) {
  if (!this._moduleNames) {
    this._moduleNames = {};
  }

  return {
    type: 'Identifier',
    name: this._moduleNames[m.filename]
  };
};
