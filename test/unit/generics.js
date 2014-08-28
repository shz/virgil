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

exports.testGenericTyperef = function(test, assert) {
  assert.equal('list<int>', calc2('let a : list<int> = null; a'));

  test.finish();
};

exports.testStruct = function(test, assert) {
  // All valid declarations, should be fine
  parse("struct Foo<'T> { a : 'T = null }");
  parse("struct Foo<'T> { a : 'T = null }; let a = new Foo<int>()");

  // Should fail due to undeclared generic params
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'B = null }");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = null }; let a = new Foo<'B>()");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = null }; let a = new Foo<'T>()");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = null }; function test { let a = new Foo<'T>() }");
  }, /undeclared/i);

  // Make sure types resolve properly
  // assert.equal('int', calc2("struct Foo<'T> { a : 'T = null }; let f = new Foo<int>(); f.a"));
  // assert.equal('int', calc2("struct Foo<'T> { a : 'T = null }; let f = new Foo<Foo<int>>(); f.a.a"));

  test.finish();
};
