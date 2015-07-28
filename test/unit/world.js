//
// Looking to add a repro case?  Check out the bottom of the file for
// the best and most straightforward examples of a full repro case
// for world issues.
//

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

test('unit', 'world', 'load()', 'should correctly mark entrypoint as compiling upon failure', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'function foo { let a: int = "OH NO" }');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  w._processModule = function(mod, callback) {
    callback(new Error('Rats'));
  };

  w.load(function(err, mod) {
    assert.isDefined(err);
    assert.isUndefined(mod);
    assert.equal(w.compiling['main.vgl'], true);

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
  var m = new ast.Module(null, 'main.vgl', 'import a; import a; function blah {}');
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

test.isolate('unit', 'world', '_loadImport()', 'circular import', function(done) {
  var cwd = process.cwd();
  process.chdir('/home');
  done.cleanup(function() {
    process.chdir(cwd);
  });

  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Manually flag the import as circular
  w.compiling['/home/base/foo/bar.vgl'] = true;
  w._loadImport(m, i, function(err, mod) {
    assert.isDefined(err);
    assert.isDefined(err.filename);
    assert.isDefined(err.src);
    assert.isDefined(err.world);
    assert.match(err.message, /circular/i);

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'memoization', function(done) {
  var cwd = process.cwd();
  process.chdir('/home');
  done.cleanup(function() {
    process.chdir(cwd);
  });

  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Manually flag the import as circular
  w.modules['/home/base/foo/bar.vgl'] = 'my value is so unique';
  w._loadImport(m, i, function(err, mod) {
    assert.ifError(err);
    assert.equal(mod, 'my value is so unique');

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'regular import', 'success', function(done) {
  var cwd = process.cwd();
  process.chdir('/home');
  var i = new ast.ImportStatement(['foo', 'bar']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m
  });

  // Mock our FS, and cleanup when done
  mockfs({
    '/home/base/foo/bar.vgl': 'export function magic {}'
  });
  done.cleanup(function() {
    mockfs.restore();
    process.chdir(cwd);
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
    assert.equal(mod.filename, '/home/base/foo/bar.vgl');
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
    assert.isDefined(err.filename);
    assert.isDefined(err.src);
    assert.isDefined(err.world);
    assert.match(err.message, /import/i);

    done();
  });
});

test.isolate('unit', 'world', '_loadImport()', 'lib import', 'success', function(done) {
  var cwd = process.cwd();
  process.chdir('/');
  var i = new ast.ImportStatement(['kronk', 'zonk']);
  var m = new ast.Module([i], 'main.vgl');
  var w = new World({
    baseDir: 'base/',
    mainModule: m,
    libs: {
      'boguz': '/bogii',
      'kronk': 'kronk'
    }
  });

  // Mock our FS, and cleanup when done
  mockfs({
    '/kronk/zonk.vgl': 'export function bonk {}'
  });
  done.cleanup(function() {
    mockfs.restore();
    process.chdir(cwd);
  });

  // Skip _processModule for now
  w._processModule = function(mod, callback) {
    assert.isDefined(mod.filename);
    assert.isDefined(w.compiling[mod.filename]);
    assert.isDefined(mod.lib);
    assert.equal(mod.lib.name, 'kronk');
    assert.deepEqual(mod.lib.importPath, ['kronk', 'zonk']);

    callback(undefined, mod);
  };

  // Manually flag the import as circular
  w._loadImport(m, i, function(err, mod) {
    assert.ifError(err);
    assert.isDefined(mod);
    assert.equal(mod.constructor, ast.Module);
    assert.equal(mod.filename, '/kronk/zonk.vgl');
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
    '/usr/local/lib/mylib/thefunk.vgl': 'import bar.baz',
    '/usr/local/lib/mylib/bar/baz.vgl': 'export function jazzhands {}'
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

    assert.equal(Object.keys(w.modules).length, 6);
    assert.isDefined(w.modules['main.vgl']);
    assert.isDefined(w.modules['/home/kraken/code/foo.vgl']);
    assert.isDefined(w.modules['/home/kraken/code/bar/baz.vgl']);
    assert.isDefined(w.modules['/usr/local/lib/mylib/core.vgl']);
    assert.isDefined(w.modules['/usr/local/lib/mylib/thefunk.vgl']);
    assert.isDefined(w.modules['/usr/local/lib/mylib/bar/baz.vgl']);

    assert.ok(!w.modules['main.vgl'].lib);
    assert.ok(!w.modules['/home/kraken/code/foo.vgl'].lib);
    assert.ok(!w.modules['/home/kraken/code/bar/baz.vgl'].lib);
    assert.ok(!!w.modules['/usr/local/lib/mylib/core.vgl'].lib);
    assert.ok(!!w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib);
    assert.ok(!!w.modules['/usr/local/lib/mylib/bar/baz.vgl'].lib);

    assert.equal(w.modules['/usr/local/lib/mylib/core.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['/usr/local/lib/mylib/bar/baz.vgl'].lib.name, 'mylib');

    assert.deepEqual(w.modules['/usr/local/lib/mylib/core.vgl'].lib.importPath, ['mylib', 'core']);
    assert.deepEqual(w.modules['/usr/local/lib/mylib/thefunk.vgl'].lib.importPath, ['mylib', 'thefunk']);
    assert.deepEqual(w.modules['/usr/local/lib/mylib/bar/baz.vgl'].lib.importPath, ['mylib', 'bar', 'baz']);

    done();
  });
});

test.isolate('unit', 'world', 'everything', 'relative', function(done) {
  // Build out a big 'ol filesystem
  var cwd = process.cwd();
  process.chdir('/home');
  mockfs({
    '/home/code/main.vgl': 'import foo',
    '/home/code/foo.vgl': 'import bar.baz',
    '/home/code/bar/baz.vgl': 'import mylib.core; import zam',
    '/home/code/bar/zam.vgl': 'export function zap {}',
    '/home/lib/mylib/core.vgl': 'import thefunk',
    '/home/lib/mylib/thefunk.vgl': 'import bar.baz',
    '/home/lib/mylib/bar/baz.vgl': 'export function jazzhands {}'
  });
  done.cleanup(function() {
    mockfs.restore();
    process.chdir(cwd);
  });

  var w = new World({
    baseDir: 'code/',
    mainModule: new ast.Module(null, 'code/main.vgl', 'import foo'), // Same as in our mockfs
    libs: { mylib: 'lib/mylib' }
  });
  w.load(function(err, m) {
    assert.ifError(err);

    assert.equal(Object.keys(w.modules).length, 7);
    assert.isDefined(w.modules['code/main.vgl']);
    assert.isDefined(w.modules['/home/code/foo.vgl']);
    assert.isDefined(w.modules['/home/code/bar/baz.vgl']);
    assert.isDefined(w.modules['/home/lib/mylib/core.vgl']);
    assert.isDefined(w.modules['/home/lib/mylib/thefunk.vgl']);
    assert.isDefined(w.modules['/home/lib/mylib/bar/baz.vgl']);

    assert.ok(!w.modules['code/main.vgl'].lib);
    assert.ok(!w.modules['/home/code/foo.vgl'].lib);
    assert.ok(!w.modules['/home/code/bar/baz.vgl'].lib);
    assert.ok(!!w.modules['/home/lib/mylib/core.vgl'].lib);
    assert.ok(!!w.modules['/home/lib/mylib/thefunk.vgl'].lib);
    assert.ok(!!w.modules['/home/lib/mylib/bar/baz.vgl'].lib);

    assert.equal(w.modules['/home/lib/mylib/core.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['/home/lib/mylib/thefunk.vgl'].lib.name, 'mylib');
    assert.equal(w.modules['/home/lib/mylib/bar/baz.vgl'].lib.name, 'mylib');

    assert.deepEqual(w.modules['/home/lib/mylib/core.vgl'].lib.importPath, ['mylib', 'core']);
    assert.deepEqual(w.modules['/home/lib/mylib/thefunk.vgl'].lib.importPath, ['mylib', 'thefunk']);
    assert.deepEqual(w.modules['/home/lib/mylib/bar/baz.vgl'].lib.importPath, ['mylib', 'bar', 'baz']);

    done();
  });
});

test.isolate('unit', 'world', 'everything', 'a regression courtesy cedrich', function(done) {
  // Build out a big 'ol filesystem
  var cwd = process.cwd();
  process.chdir('/home');
  var files = {
    '/home/src/main.vgl': 'import lib.nothing\n export function foo(n: Nothing) { n.name = "asdf" }',
    '/home/lib/something.vgl': 'export struct Something { name: str = "i am something" }',
    '/home/lib/nothing.vgl': 'import something\n export struct Nothing { name: str = "I am nothing"\n otherThing: Something = null }'
  };
  mockfs(files);
  done.cleanup(function() {
    mockfs.restore();
    process.chdir(cwd);
  });

  var w = new World({
    baseDir: 'src/',
    mainModule: new ast.Module(null, 'main.vgl', files['/home/src/main.vgl']),
    libs: { lib: 'lib' }
  });
  w.load(function(err, m) {
    assert.ifError(err);

    assert.equal(Object.keys(w.modules).length, 3);
    assert.isDefined(w.modules['main.vgl']);
    assert.isDefined(w.modules['/home/lib/something.vgl']);
    assert.isDefined(w.modules['/home/lib/nothing.vgl']);

    assert.ok(!w.modules['main.vgl'].lib);
    assert.ok(!!w.modules['/home/lib/something.vgl'].lib);
    assert.ok(!!w.modules['/home/lib/nothing.vgl'].lib);

    assert.equal(w.modules['/home/lib/something.vgl'].lib.name, 'lib');
    assert.equal(w.modules['/home/lib/nothing.vgl'].lib.name, 'lib');

    assert.deepEqual(w.modules['/home/lib/something.vgl'].lib.importPath, ['lib', 'something']);
    assert.deepEqual(w.modules['/home/lib/nothing.vgl'].lib.importPath, ['lib', 'nothing']);

    done();
  });
});
