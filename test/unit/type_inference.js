var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

exports.testDirect = function(test, assert) {
  assert.equal('bool', calc('true'));
  assert.equal('bool', calc('false'));
  assert.equal('int', calc('1'));
  assert.equal('int', calc('174'));
  assert.equal('float', calc('1f'));
  assert.equal('float', calc('1.0'));
  assert.equal('str', calc('"blah blah blah"'));

  test.finish();
};

exports.testArithmetic = function(test, assert) {
  assert.equal('int', calc('1 + 1'));
  assert.equal('str', calc('"hi" + "bye"'));
  assert.equal('float', calc('1.0 + 2'));

  assert.equal('int', calc('1 - 1'));
  assert.equal('int', calc('1 * 1'));
  assert.equal('int', calc('1 / 1'));
  assert.equal('int', calc('1 % 1'));
  assert.equal('int', calc('1 ** 1'));

  assert.throws(function() {
    calc('"hi" * "bye"');
  });
  assert.throws(function() {
    calc('true + false');
  });

  test.finish();
};

exports.testTernary = function(test, assert) {
  assert.equal('int', calc('true ? 1 : 2'));
  assert.throws(function() {
    calc('true ? 1 : "hi"');
  });

  test.finish();
};

exports.testListExpression = function(test, assert) {
  assert.equal('list<int>', calc('[1, 2, 3]'));
  assert.equal('list<float>', calc('[1.0f, 1.0]'));
  assert.equal('list<str>', calc('["foo", "bar"]'));
  assert.equal('list<list<int>>', calc('[[1, 2], [1]]'));
  assert.equal('int', calc('[1, 2, 3][1]'));
  assert.equal('inferred', calc('[]'));

  assert.throws(function() {
    calc('[1, 1.0]');
  });
  assert.throws(function() {
    calc('[[1], ["foo"]]');
  });

  test.finish();
};

exports.testIdentifier = function(test, assert) {
  assert.equal('int', calc2('let a = 1; a'));
  assert.equal('int', calc2('let a = 1; let b = a; b'));
  assert.throws(function() {
    calc2('let a = null; a');
  });
  assert.throws(function() {
    calc2('let b = a; let a = 1');
  });

  test.finish();
};

exports.testEmptyList = function(test, assert) {
  assert.equal('list<int>', calc2('let a : list<int> = []; a'));
  assert.equal('int', calc2('let a : list<int> = []; a[1]'));

  assert.throws(function() {
    calc2('let a = []; a');
  });

  test.finish();
};

exports.testStruct = function(test, assert) {
  assert.equal('Widget', calc2('struct Widget {}; let a : Widget = null; a'));
  assert.equal('Widget', calc2('struct Widget {}; let a = Widget(); a'));

  test.finish();
};

exports.testLaxNumerics = function(test, assert) {
  assert.equal('float', calc2('let a : float = 1; a'));
  assert.equal('int', calc2('let a = 1.0; let b : int = a; b'));

  test.finish();
};

exports.testFunction = function(test, assert) {
  assert.equal('int', calc2('function foobar : int { return 1 }; let fb = foobar(); fb'));
  assert.throws(function() {
    calc2('function foobar {}; let fb2 = foobar(); fb2');
  });

  test.finish();
};

exports.testPropertyAccess = function(test, assert) {
  assert.equal('int', calc2('struct A { a = 1 }; let t = A(); t.a;'));
  assert.throws(function() {
    calc2('struct A { z = 1 }; let t = A(); t.a;');
  });

  test.finish();
};
