var ast = require('./../../../../lib/ast')
  , moduleUtils = require('./../../../../lib/converters/javascript/module_utils')
  ;

var mod = function(baseDir, filename, mlib) {
  return {
    imp: function(parts, lib) {
      var m = new ast.Module([], filename, '');
      m.lib = lib || null;
      var imp = new ast.ImportStatement(parts);
      imp.ast = m;

      return moduleUtils.getDeclarationForImport.call({
        _moduleNames: lib ? {} : undefined, // Nasty ugly crappy hack to get full test coverage
        baseDir: baseDir,
        currentModule: { filename: filename, lib: mlib },
        getIdentifierForModule: moduleUtils.getIdentifierForModule
      }, imp).declarations[0].init.arguments[0].value;
    }
  };
};

test('unit', 'converters', 'javascript', 'module_utils', 'getDeclarationForImport()', function() {
  var m = mod('base', 'base/baz.vgl');

  // Basic tests relative to a base
  assert.equal('./foo/bar.js', m.imp(['foo', 'bar']));
  assert.equal('./foo.js', m.imp(['foo']));

  // Lib imports
  assert.equal('./mylib/foo.js', m.imp(['mylib', 'foo'], {
    name: 'mylib',
    importPath: ['mylib', 'foo']
  }));

  // Absolute tests
  m = mod('/src', '/src/main.vgl');
  assert.equal('./foo.js', m.imp(['foo']));
  assert.equal('./mylib/bar.js', m.imp(['mylib', 'foo'], {
    name: 'mylib',
    importPath: ['mylib', 'bar']
  }));

// <<<<<<< HEAD
//   // Lib include hack tests
//   var imp = {
//     name: '$Foo',
//     ast: {
//       lib: {
//         importPath: ['virgil', 'foo']
//       }
//     }
//   };
//   var result = moduleUtils.getDeclarationForImport.call({
//     _moduleNames: undefined,
//     baseDir: '/src',
//     currentModule: { filename: '/src/bar/main.vgl' },
//     getIdentifierForModule: moduleUtils.getIdentifierForModule
//   }, imp).declarations[0];
//   assert.equal(result.init.arguments[0].value, './../virgil/foo.js');
//   assert.equal(result.id.name, '$Foo');
// =======
  // Relative test with lib
  m = mod('base', 'base/baz.vgl', {
    name: 'mylib',
    importPath: ['mylib', 'cool']
  });
  assert.equal('./foo/bar.js', m.imp(['foo', 'bar']));
  assert.equal('./foo.js', m.imp(['foo']));
  assert.equal('./foo.js', m.imp(['foo'], {
    name: 'mylib',
    importPath: ['mylib', 'foo']
  }));
// >>>>>>> origin/master
});

// This test isn't the greatest, but it does get the job done
test('unit', 'converters', 'javascript', 'module_utils', 'getIdentifierForModule()', function() {
  var o = {};

  var call = function(filename) {
    return (moduleUtils.getIdentifierForModule.call(o, {filename: filename}) || {}).name;
  };

  // If o is missing moduleNames, make sure it doesn't throw
  call('missing.vgl');

  // Manually set up
  o._moduleNames = {
    'foo.vgl': 'booga'
  };
  assert.equal('booga', call('foo.vgl'));
});
