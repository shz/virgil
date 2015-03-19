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

exports.getDeclarationForImport = function(import) {
  if (!this._moduleNames) {
    this._moduleNames = {};
  }

  var name = '$m_' + import.module.join('_');
  this._moduleNames[import.filename] = name;

  return {
    type: 'VariableDeclaration',
    kind: 'var',
    declarations: [{
      type: 'VariableDeclarator',
      id: this.getIdentifierForModule({path: import.filename}),
      init: {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'require' },
        arguments: [{
          type: 'Literal',
          value: './' + import.filename,
          raw: './' + import.filename
        }]
      }
    }]
  };
};
exports.getIdentifierForModule = function(module) {
  if (!this._moduleNames) {
    this._moduleNames = {};
  }

  return {
    type: 'Identifier',
    name: this._moduleNames[module.path]
  };
};
