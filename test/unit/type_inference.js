var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  ;

var calc = function(str) {
  var tree = parser(str)[0];
  return types.calculate(parser(str)[0]);
};

exports.testDirect = function(test, assert) {
  assert.equal(types.canned['bool'], calc('true'));
  assert.equal(types.canned['bool'], calc('false'));
  assert.equal(types.canned['int'], calc('1'));
  assert.equal(types.canned['int'], calc('174'));
  assert.equal(types.canned['float'], calc('1f'));
  assert.equal(types.canned['float'], calc('1.0'));
  assert.equal(types.canned['str'], calc('"blah blah blah"'));

  test.finish();
};

exports.testArithmetic = function(test, assert) {
  assert.equal(types.canned['int'], calc('1 + 1'));
  assert.equal(types.canned['str'], calc('"hi" + "bye"'));
  assert.equal(types.canned['float'], calc('1.0 + 2'));

  assert.equal(types.canned['int'], calc('1 - 1'));
  assert.equal(types.canned['int'], calc('1 * 1'));
  assert.equal(types.canned['int'], calc('1 / 1'));
  assert.equal(types.canned['int'], calc('1 % 1'));
  assert.equal(types.canned['int'], calc('1 ** 1'));

  assert.throws(function() {
    calc('"hi" * "bye"');
  });
  assert.throws(function() {
    calc('true + false');
  });

  test.finish();
};

exports.testTernary = function(test, assert) {
  assert.equal(types.canned['int'], calc('true ? 1 : 2'));
  assert.throws(function() {
    calc('true ? 1 : "hi"');
  });

  test.finish();
};
