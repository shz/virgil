var mockfs = require('mock-fs')
  , World = require('../../lib/world')
  , ast = require('../../lib/ast')
  ;

//
// Basics
//

test('unit', 'world', 'creation', function() {
  // Required params
  assert.throws(function() {
    var w = new World();
  }, /options/);
  assert.throws(function() {
    var w = new World({});
  }, /options/);
  assert.throws(function() {
    var w = new World({baseDir: 'a'});
  }, /options/);
  assert.throws(function() {
    var w = new World({mainModule: 'm'});
  }, /options/);
  var w = new World({baseDir: 'a', mainModule: 'm'});
});

test('unit', 'world', 'load()', 'should process module', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'function foo {}');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Confirm that processmodule is called
  var processed = null;
  w._processModule = function(mod, callback) {
    processed = mod;
    callback(undefined, mod);
  };

  w.load(function(err, mod) {
    assert.ifError(err);
    assert.equal(processed, mod);
    assert.equal(mod, m);

    done();
  });
});

//
// _processModule()
//

test('unit', 'world', '_processModule()', 'autocompile error', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'export function bla#$^#$%');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  w._processModule(m, function(err) {
    assert.isDefined(err);
    assert.equal(err.world, w);
    assert.equal(err.src, m.src);

    done();
  });
});

test('unit', 'world', '_processModule()', 'empty module', function(done) {
  var m = new ast.Module(null, 'main.vgl'); // no body, no source
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  w._processModule(m, function(err) {
    assert.isDefined(err);
    assert.match(err.message, /compile/);

    done();
  });
});

test('unit', 'world', '_processModule()', 'duplicate imports', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'import a; import a function blah {}');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  w._processModule(m, function(err) {
    assert.isDefined(err);
    assert.match(err.message, /import/);
    assert.isDefined(err.world);
    assert.isDefined(err.src);
    assert.equal(err.world, w);
    assert.equal(err.src, m.src);

    done();
  });
});

test('unit', 'world', '_processModule()', 'no imports', function(done) {
  var m = new ast.Module([], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  w._processModule(m, function(err) {
    assert.ifError(err);
    assert.equal(Object.keys(w.modules).length, 1);
    assert.equal(Object.keys(w.modules)[0], 'main.vgl');
    assert.equal(w.modules['main.vgl'], m);

    done();
  });
});

test('unit', 'world', '_processModule()', 'some imports', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'import foo; import foo.bar; import baz; function blah {}');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Stub out _loadImport to just do some verification
  var loadedImports = {};
  w._loadImport = function(mod, imp, callback) {
    loadedImports[imp.module.join('.')] = mod;
    callback();
  };

  w._processModule(m, function(err) {
    assert.ifError(err);

    assert.equal(Object.keys(loadedImports).length, 3);
    assert.equal(loadedImports['foo'], m);
    assert.equal(loadedImports['foo.bar'], m);
    assert.equal(loadedImports['baz'], m);

    done();
  });
});

test('unit', 'world', '_processModule()', 'import exceptions', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'import foo; import foo.bar; import baz; function blah {}');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Stub out _loadImport to just do some verification
  var loadedImports = {};
  w._loadImport = function(mod, imp, callback) {
    callback(new Error('Terrible terrible damage'));
  };

  w._processModule(m, function(err) {
    assert.isDefined(err);
    assert.equal(err.message, 'Terrible terrible damage');

    done();
  });
});

//
// _loadImport()
//

test('unit', 'world', '_loadImport()', 'circular import', function(done) {
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Manually flag the import as circular
  w.compiling['./foo/bar.vgl'] = true;
  w._loadImport(m, i, function(err, mod) {
    assert.isDefined(err);
    assert.match(err.message, /circular/i);

    done();
  });
});

test('unit', 'world', '_loadImport()', 'memoization', function(done) {
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Manually flag the import as circular
  w.modules['./foo/bar.vgl'] = 'my value is so unique';
  w._loadImport(m, i, function(err, mod) {
    assert.ifError(err);
    assert.equal(mod, 'my value is so unique');

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'regular import', 'success', function(done) {
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Mock our FS, and cleanup when done
  mockfs({
    'base/foo/bar.vgl': 'export function magic {}'
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  // Skip _processModule for now
  w._processModule = function(m, callback) {
    assert.isDefined(m.filename);
    assert.isDefined(w.compiling[m.filename]);

    callback(undefined, m);
  };

  // Manually flag the import as circular
  w._loadImport(m, i, function(err, mod) {
    assert.ifError(err);
    assert.isDefined(mod);
    assert.equal(mod.constructor, ast.Module);
    assert.equal(mod.filename, './foo/bar.vgl');
    assert.ok(!mod.lib);
    assert.isUndefined(w.compiling[mod.filename]);

    // Note that we AREN'T testing this:
    //
    //     assert.isDefined(w.modules[mod.filename]);
    //
    // Because normally _processModule() sets it, but we've stubbed
    // that out.

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'regular import', 'processing failure', function(done) {
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Mock our FS, and cleanup when done
  mockfs({
    'base/foo/bar.vgl': 'export function magic {}'
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  // Skip _processModule for now
  w._processModule = function(m, callback) {
    assert.isDefined(m.filename);
    assert.isDefined(w.compiling[m.filename]);

    callback(new Error('it dun broke'));
  };

  // Manually flag the import as circular
  w._loadImport(m, i, function(err, mod) {
    assert.isDefined(err);
    assert.equal(err.message, 'it dun broke');

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'regular import', 'missing file', function(done) {
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m,
    libs: { zoom: '/boom' }
  });

  // Mock our FS, and cleanup when done
  mockfs({
    'base/foo/': {}
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  // Skip _processModule for now
  w._processModule = function(m, callback) {
    assert.isDefined(m.filename);
    assert.isDefined(w.compiling[m.filename]);

    callback(undefined, m);
  };

  // Manually flag the import as circular
  w._loadImport(m, i, function(err, mod) {
    assert.isDefined(err);
    assert.match(err.message, /import/i);

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'lib import', 'success', function(done) {
  var i = new ast.ImportStatement(['kronk', 'zonk']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: '/base/',
    mainModule: m,
    libs: {
      'boguz': '/bogii',
      'kronk': '../kronk'
    }
  });

  // Mock our FS, and cleanup when done
  mockfs({
    '/kronk/zonk.vgl': 'export function bonk {}'
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  // Skip _processModule for now
  w._processModule = function(m, callback) {
    assert.isDefined(m.filename);
    assert.isDefined(w.compiling[m.filename]);

    callback(undefined, m);
  };

  // Manually flag the import as circular
  w._loadImport(m, i, function(err, mod) {
    assert.ifError(err);
    assert.isDefined(mod);
    assert.equal(mod.constructor, ast.Module);
    assert.equal(mod.filename, '../kronk/zonk.vgl');
    assert.isUndefined(w.compiling[mod.filename]);
    assert.isDefined(mod.lib);
    assert.equal(mod.lib.name, 'kronk');
    assert.deepEqual(mod.lib.importPath, ['kronk', 'zonk']);

    // Note that we AREN'T testing this:
    //
    //     assert.isDefined(w.modules[mod.filename]);
    //
    // Because normally _processModule() sets it, but we've stubbed
    // that out.

    done();
  });
});

//
// Everyzig
//

test.isolate('unit', 'world', 'everything', 'absolute', function(done) {
  // Build out a big 'ol filesystem
  mockfs({
    '/home/kraken/code/main.vgl': 'import foo',
    '/home/kraken/code/foo.vgl': 'import bar.baz',
    '/home/kraken/code/bar/baz.vgl': 'import mylib.core',
    '/usr/local/lib/mylib/core.vgl': 'import thefunk',
    '/usr/local/lib/mylib/thefunk.vgl': 'export function jazzhands {}'
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  var w = new World({
    baseDir: '/home/kraken/code',
    mainModule: new ast.Module(null, 'main.vgl', 'import foo'), // Same as in our mockfs
    libs: { mylib: '/usr/local/lib/mylib' }
  });
  w.load(function(err, m) {
    assert.ifError(err);

    assert.isDefined(w.modules['main.vgl']);
    assert.isDefined(w.modules['./foo.vgl']);
    assert.isDefined(w.modules['./bar/baz.vgl']);
    assert.isDefined(w.modules['/usr/local/lib/mylib/core.vgl']);
    assert.isDefined(w.modules['/usr/local/lib/mylib/thefunk.vgl']);

    assert.ok(!w.modules['main.vgl'].lib);
    assert.ok(!w.modules['./foo.vgl'].lib);
    assert.ok(!w.modules['./bar/baz.vgl'].lib);
    assert.ok(!!w.modules['/usr/local/lib/mylib/core.vgl'].lib);
    assert.ok(!!w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib);

    assert.equal(w.modules['/usr/local/lib/mylib/core.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib.name, 'mylib');

    assert.deepEqual(w.modules['/usr/local/lib/mylib/core.vgl'].lib.importPath, ['mylib', 'core']);
    assert.deepEqual(w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib.importPath, ['mylib', 'thefunk']);

    done();
  });
});

test.isolate('unit', 'world', 'everything', 'relative', function(done) {
  // Build out a big 'ol filesystem
  var cwd = process.cwd();
  process.chdir(process.env.HOME);
  mockfs({
    'code/main.vgl': 'import foo',
    'code/foo.vgl': 'import bar.baz',
    'code/bar/baz.vgl': 'import mylib.core',
    'lib/mylib/core.vgl': 'import thefunk',
    'lib/mylib/thefunk.vgl': 'export function jazzhands {}'
  });
  done.cleanup(function() {
    mockfs.restore();
    process.chdir(cwd);
  });

  var w = new World({
    baseDir: 'code/',
    mainModule: new ast.Module(null, 'main.vgl', 'import foo'), // Same as in our mockfs
    libs: { mylib: '../lib/mylib' }
  });
  w.load(function(err, m) {
    assert.ifError(err);

    assert.isDefined(w.modules['main.vgl']);
    assert.isDefined(w.modules['./foo.vgl']);
    assert.isDefined(w.modules['./bar/baz.vgl']);
    assert.isDefined(w.modules['../lib/mylib/core.vgl']);
    assert.isDefined(w.modules['../lib/mylib/thefunk.vgl']);

    assert.ok(!w.modules['main.vgl'].lib);
    assert.ok(!w.modules['./foo.vgl'].lib);
    assert.ok(!w.modules['./bar/baz.vgl'].lib);
    assert.ok(!!w.modules['../lib/mylib/core.vgl'].lib);
    assert.ok(!!w.modules['../lib/mylib/thefunk.vgl'].lib);

    assert.equal(w.modules['../lib/mylib/core.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['../lib/mylib/thefunk.vgl'].lib.name, 'mylib');

    assert.deepEqual(w.modules['../lib/mylib/core.vgl'].lib.importPath, ['mylib', 'core']);
    assert.deepEqual(w.modules['../lib/mylib/thefunk.vgl'].lib.importPath, ['mylib', 'thefunk']);

    done();
  });
});

