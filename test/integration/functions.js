var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var parse = function(str) {
  passes.runAll(parser.snippet(str));
};

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

test('integration', 'functions', 'function assigment', function() {
  assert.equal('int', calc2('function a : int { return 1 } ; let b = a() ; b'));
  assert.throws(function() {
    calc2('function a { } ; let b = a()');
  }, /void/);
  assert.throws(function() {
    calc2('function a {} ; mut b = 1 ; b = a() ; b');
  }, /void/);
});

test('integration', 'functions', 'signature typing', function() {
  parse('function nop {}; nop()');

  assert.throws(function() {
    parse('function foobar(i : int) {}; foobar(1, 2)');
  }, /arguments/i);
  assert.throws(function() {
    parse('function foobar(i : int) {}; foobar()');
  }, /arguments/i);
  assert.throws(function() {
    parse('function foobar(i : int) {}; let f = foobar; f(1, 2)');
  }, /arguments/i);
  assert.throws(function() {
    parse('let a = 1; a()');
  }, /callable/i);
});

test('integration', 'functions', 'function types', function() {
  parse('function a(i : int) {}; a(1)');

  assert.throws(function() {
    parse('function a(i : int) {}; a("hi")');
  }, /type/);
});

// This is a regression test, interesting case...
test('integration', 'functions', 'function properties', function() {
  // Should throw an invalid property exception, nothing else
  assert.throws(function() {
    parse('function a(i : int) {}; a.foo');
  }, /foo/);
  assert.throws(function() {
    parse('method a(i : int) {}; 1.a.foo');
  }, /foo/);
});

