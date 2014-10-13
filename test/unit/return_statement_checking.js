var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var parse = function(str) {
  passes.runAll(parser.snippet(str));
};

exports.testEmpty = function(test, assert) {
  // These shouldn't fail
  parse('function a {}');
  parse('method foo(a : int) {}');
  parse('lambda {}');
  parse('function a { return void }');
  parse('method foo(a : int) { return void }');
  parse('lambda { return void }');

  assert.throws(function() {
    parse('function a : int {}');
    parse('method foo(a : int) : int {}');
    parse('lambda : int {}');
    parse('function a : int { return void }');
    parse('method foo(a : int) : int { return void }');
    parse('lambda : int { return void }');
  }, /retur/);

  test.finish();
};

exports.testUserDefined = function(test, assert) {
  // These shouldn't fail
  parse('struct A {}; function a : A { return null }');

  test.finish();
};
