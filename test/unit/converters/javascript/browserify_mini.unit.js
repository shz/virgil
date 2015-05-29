var browserifyMini = require('../../../../lib/converters/javascript/browserify_mini');

var run = function(filemap, entrypoint) {
  var src = browserifyMini(filemap, entrypoint);
  assert.ok(src.match(/modules\[\d+\]\s*=/g).length <= Object.keys(filemap).length);
  return eval(src);
};

test('unit', 'converters', 'javascript', 'browserify mini', 'basic', function() {
  var filemap = {
    'a.js': 'var b = require("./b.js"); exports.message = function() { return "hello world" };',
    'b.js': ''
  };

  var result = run(filemap, 'a.js');
  assert.isDefined(result);
  assert.isDefined(result.message);
  assert.equal(typeof result.message, 'function');
  assert.equal(result.message(), 'hello world');
});

test('unit', 'converters', 'javascript', 'browserify mini', 'bad file', function() {
  var filemap = {
    'a.js': 'require("./b.js");',
    'b.js': 'require("./c.js");'
  };

  assert.throws(function() {
    run(filemap, 'a.js');
  }, /not in/i);
});

test('unit', 'converters', 'javascript', 'browserify mini', 'circular', function() {
  var filemap = {
    'a.js': 'require("./b.js");',
    'b.js': 'require("./a.js");'
  };

  assert.throws(function() {
    run(filemap, 'a.js');
  }, /circular/i);
});

test('unit', 'converters', 'javascript', 'browserify mini', 'complex', function() {
  var filemap = {
    'a.js': 'var b = require("./b.js"); var c = require("./c.js");' +
      'exports.message = "" + b.b + c.c;',
    'b.js': 'var c = require("./c.js"); exports.b = "b";',
    'c.js': 'var d = require("./d.js"); exports.c = "c"',
    'd.js': 'exports.d = "d"'
  };

  var result = run(filemap, 'a.js');
  assert.isDefined(result);
  assert.isDefined(result.message);
  assert.equal(result.message, 'bc');
});
