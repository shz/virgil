var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
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

exports.testFunctionAssignment = function(test, assert) {
  assert.equal('int', calc2('function a : int { return 1 } ; let b = a() ; b'));
  assert.throws(function() {
    calc2('function a { } ; let b = a()');
  }, /void/);
  assert.throws(function() {
    calc2('function a {} ; mut b = 1 ; b = a() ; b');
  }, /void/);

  test.finish();
};

exports.testSignatureTyping = function(test, assert) {
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

  test.finish();
};

exports.testFunctionTypes = function(test, assert) {
  parse('function a(i : int) {}; a(1)');

  assert.throws(function() {
    parse('function a(i : int) {}; a("hi")');
  }, /type/);

  test.finish();
};
