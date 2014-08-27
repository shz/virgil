var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var parse = function(str) {
  passes.runAll(parser.statement(str));
};

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

exports.testGenericTyperef = function(test, assert) {
  assert.equal('list<int>', calc2('let a : list<int> = null; a'));

  test.finish();
};

exports.testStructChecking = function(test, assert) {
  // Should not throw
  parse("struct Foo<'T> { a : 'T = null }");

  // Should throw
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'B = null }");
  }, /undeclared/i);

  test.finish();
};
