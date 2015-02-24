var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var parse = function(str) {
  passes.runAll(parser.snippet(str));
};

test('integration', 'return statement checking', 'empty', function() {
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
});

test('integration', 'return statement checking', 'user defined', function() {
  // These shouldn't fail
  parse('struct A {}; function a : A { return null }');
});
