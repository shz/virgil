var ast = require('./../../../../lib/ast')
  , moduleUtils = require('./../../../../lib/converters/javascript/module_utils')
  ;

var tool = function(baseDir, currentFilename, parts, underlying, lib) {
  var m = new ast.Module([], underlying, '');
  m.lib = lib || null;
  var imp = new ast.ImportStatement(parts);
  imp.ast = m;

  var wrap = function(thing) {
    return { get: function() { return thing } };
  };

  return Object.create(moduleUtils, {
    node: wrap(imp),
    m: wrap(m),
    baseDir: wrap(baseDir),
    currentModule: wrap({ filename: currentFilename }),
    jsRequirePath: { get: function() {
      return this.getDeclarationForImport(this.node).declarations[0].init.arguments[0].value;
    }}
  });
};

test('unit', 'converters', 'javascript', 'module_utils', function() {
  assert.equal('./foo/bar.js', tool('base', 'base/baz.vgl', ['foo', 'bar'], 'base/foo/bar.vgl').jsRequirePath);
});
