var fs = require('fs')
  , watch = require('../../lib/support/watch')
  ;

test.isolate('unit', 'watch.js', 'everything', function(done) {
  // Used by all tests
  var called = 0;
  var watchInfo = null;

  var setup = function() {
    called = 0;
    watchInfo = {
      mtime: {},
      watchers: {},
      opened: {},
      closed: {},
      trigger: function(filename) {
        watchInfo.watchers[filename].forEach(function(f) { f() });
      },
      modify: function(filename, t) {
        watchInfo.mtime[filename] = t;
      }
    };
  };

  // Monkey patch the fs methods we're playing with.
  var oldWatch = fs.watch;
  var oldStat = fs.stat;
  fs.watch = function(filename) {
    if (!watchInfo.watchers[filename]) {
      watchInfo.watchers[filename] = [];
    }
    watchInfo.opened[filename] = true;
    return {
      close: function() {
        watchInfo.closed[filename] = true;
      },
      on: function(event, callback) {
        assert.equal(event, 'change');
        watchInfo.watchers[filename].push(callback);
      }
    };
  };
  fs.stat = function(filename, callback) {
    var result = watchInfo.mtime[filename] || 0;
    if (typeof result != 'number') {
      callback(result);
    } else {
      callback(undefined, {mtime: result});
    }
  };
  done.cleanup(function() {
    fs.watch = oldWatch;
    fs.stat = oldStat;
  });

  // The dummy world we'll run with
  var world = {
    modules: {
      foo: { filename: '/bar/foo' },
      baz: { filename: '/bar/baz' }
    },
    compiling: {
      '/lib/zam': true
    }
  };
  var watcher = function(filename) {
    called++;
    assert.equal(filename, '/bar/foo');
  };

  // For this test, we'll watch the world, modify one file, and trigger
  // the callback.
  setup();
  watch(world, watcher);
  assert.equal(Object.keys(watchInfo.opened).length, 3);
  assert.isDefined(watchInfo.opened['/bar/foo']);
  assert.isDefined(watchInfo.opened['/bar/baz']);
  assert.isDefined(watchInfo.opened['/lib/zam']);
  watchInfo.modify('/bar/foo', 10);
  watchInfo.trigger('/bar/foo');
  assert.isDefined(watchInfo.closed['/bar/foo']);
  assert.isDefined(watchInfo.closed['/bar/baz']);
  assert.isDefined(watchInfo.closed['/lib/zam']);
  assert.equal(called, 1);


  // For this test, we'll change the mtime of the file BEFORE we begin
  // watching, which means the callback shouldn't actually fire.
  setup();
  watchInfo.modify('/bar/foo', 10);
  watch(world, watcher);
  watchInfo.trigger('/bar/foo');
  assert.equal(called, 0)

  // For this test, we'll change mtime so that the file does fire a
  // callback, but we'll do it *twice*.  This should only result
  // in a single callback being fired, since the watcher will stop
  // after the first one.
  setup();
  watch(world, watcher);
  watchInfo.modify('/bar/foo', 1);
  watchInfo.trigger('/bar/foo');
  watchInfo.modify('/bar/foo', 2);
  watchInfo.trigger('/bar/foo');
  assert.equal(called, 1);

  // For this test, test error handling on underlying fs.stat calls.
  // Everything should function normally without:
  //  * If the initial stat fails, the file will not be watched
  //  * If the stat-on-trigger fails, callback is always fires
  setup();
  watchInfo.modify('/bar/baz', 'error');
  watch(world, watcher);
  assert.isUndefined(watchInfo.opened['/bar/baz']);
  watchInfo.modify('/bar/foo', 'error');
  watchInfo.trigger('/bar/foo');
  assert.equal(called, 1);

  done();
});
