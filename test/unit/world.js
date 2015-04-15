var World = require('../../lib/world')
  , ast = require('../../lib/ast')
  ;

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
    baseDir: 'foo/',
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

test('unit', 'world', '_processModule()', 'autocompile error', function(done) {
  var m = new ast.Module(null, 'main.vgl', 'export function bla#$^#$%');
  var w = new World({
    baseDir: 'foo/',
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
    baseDir: 'foo/',
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
    baseDir: 'foo/',
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
    baseDir: 'foo/',
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
    baseDir: 'foo/',
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
    baseDir: 'foo/',
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

