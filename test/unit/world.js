var World = require('./util/require')('world')
  , async = require('async')
  , path = require('path')
  ;

exports.testFilenameResolution = function(test, assert) {
  var w = new World('/tmp/foo.vgl');

  assert.equal(w.entry, '/tmp/foo.vgl');
  assert.equal(w.base, '/tmp');
  assert.equal(w.toFilename(w.base, 'something'), 'something.vgl');
  assert.equal(w.toFilename(w.base, 'sub.something'), 'sub/something.vgl');
  assert.equal(w.toFilename(w.base, 'sub.sub.something'), 'sub/sub/something.vgl');

  test.finish();
};

exports.testImports = function(test, assert) {
  var w = new World(path.join(__dirname, '..', 'unit-files', 'import', 'main.vgl'));

  async.parallel([
    w.parse.bind(w, w.base, 'a'),
    w.parse.bind(w, w.base, 'b'),
  ], function(err) {
    assert.ifError(err);

    assert.isDefined(w.modules['a.vgl']);
    assert.isDefined(w.modules['b.vgl']);
    assert.isUndefined(w.compiling['a.vgl']);
    assert.isUndefined(w.compiling['b.vgl']);

    test.finish();
  });

  assert.isDefined(w.compiling['a.vgl']);
  assert.isDefined(w.compiling['b.vgl']);
};

exports.testCircularDetection = function(test, assert) {
  var w = new World(path.join(__dirname, '..', 'unit-files', 'circular', 'main.vgl'));

  async.parallel([
    w.parse.bind(w, w.base, 'a'),
  ], function(err) {
    assert.isDefined(err);

    test.finish();
  });
};
