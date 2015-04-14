var World = require('../../lib/world')
  , async = require('async')
  , path = require('path')
  ;

test('unit', 'world', 'creation', function() {
  // Required params
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

test.isolate('unit', 'world', 'basic', function(done) {
  done.cleanup(function() {

  });
  done();
});
