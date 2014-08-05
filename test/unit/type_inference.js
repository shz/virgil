var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  ;

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
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

  assert.throws(function() {
    calc('[1, 1.0]');
  });
  assert.throws(function() {
    calc('[[1], ["foo"]]');
  });

  test.finish();
};
