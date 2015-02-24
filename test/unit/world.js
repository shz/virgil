var World = require('../../lib/world')
  , async = require('async')
  , path = require('path')
  ;

test('unit', 'world', 'filename resolution', function() {
  var w = new World('/tmp/foo.vgl');

  assert.equal(w.entry, '/tmp/foo.vgl');
  assert.equal(w.base, '/tmp');
  assert.equal(w.toFilename(w.base, 'something'), 'something.vgl');
  assert.equal(w.toFilename(w.base, 'sub.something'), 'sub/something.vgl');
  assert.equal(w.toFilename(w.base, 'sub.sub.something'), 'sub/sub/something.vgl');
});

test('unit', 'world', 'imports', function(done) {
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

    done()
  });
});

test('unit', 'world', 'circular detection', function(done) {
  var w = new World(path.join(__dirname, '..', 'unit-files', 'circular', 'main.vgl'));

  async.parallel([
    w.parse.bind(w, w.base, 'a'),
  ], function(err) {
    assert.isDefined(err);

    done();
  });
});
