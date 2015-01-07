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

exports.testEnsureDefault = function(test, assert) {
  // Just make sure these don't fail
  parse("struct Foo<'T> { a : 'T = default }");
  parse("struct Foo<'T> { a : 'T = null }");

  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = 1 }");
  }, /defined/);

  test.finish();
};

exports.testStruct = function(test, assert) {
  // All valid declarations, should be fine
  parse("struct Foo<'T> { a : 'T = default }");
  parse("struct Foo<'T> { a : 'T = default }; let a = new Foo<int>");

  // Should fail due to undeclared generic params
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'B = default }");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = default }; let a = new Foo<'B>");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = default }; let a = new Foo<'T>");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T> { a : 'T = default }; function test { let a = new Foo<'T> }");
  }, /undeclared/i);
  assert.throws(function() {
    parse("struct Foo<'T, 'A> { a : 'T = default }; function test { let a = new Foo<int> }");
  }, /parameters/);

  // Make sure types resolve properly
  assert.equal('int', calc2("struct Foo<'T> { a : 'T = default }; let f = new Foo<int>; f.a"));
  assert.equal('int', calc2("struct Foo<'T> { a : 'T = default }; let f = new Foo<Foo<int>>; f.a.a"));

  test.finish();
};

exports.testFunction = function(test, assert) {
  // All valid declarations, should be fine
  parse("function nop(x : 'T) {}");
  parse("function nop(x : 'T) : 'T { return x }");
  parse("function nop(x : 'T) { let foo : 'T = default }");
  parse("function nop(x : 'T) { mut foo : 'T = default; foo = x }");
  parse("function nop(x : 'T) : 'T { mut foo : 'T = default; foo = x; return foo }");
  parse("function nop(x : 'T) { function inner(y : 'B) { } }");
  parse("function first(x : list<'T>) : 'T { return x[0] }");

  // Should fail due to undeclared generic params
  assert.throws(function() {
    parse("function nop(x : int) : 'T {}");
  }, /undeclared/i);
  assert.throws(function() {
    parse("function nop(x : 'T) : 'B {}");
  }, /undeclared/i);
  assert.throws(function() {
    parse("function nop(x : 'T) : 'T { let foo : 'B = default }");
  }, /undeclared/i);
  assert.throws(function() {
    parse("function first(x : list<'T>) : 'B { return x[0] }");
  }, /undeclared/i);

  // Should fail due to redeclared generic params
  assert.throws(function() {
    parse("function nop(x : 'T) { function inner(y : 'T) {} }");
  }, /use/i);

  // Make sure types resolve properly
  assert.equal('int', calc2("function nop(x : 'T) : 'T { return x }; nop(12)"));
  assert.equal('int', calc2("function first(x : list<'T>) : 'T { return x[0] }; first([1])"));
  assert.equal('int', calc2("function a(x : 'T) : 'T { function b(x : 'R) : 'R { return x }; return b(x) }; a(1)"));

  test.finish();
};


exports.testMethod = function(test, assert) {
  // All valid declarations, should be fine
  parse("method nop(a : int, x : 'T) {}");
  parse("method nop(a : int, x : 'T) : 'T { return x }");
  parse("method nop(a : int, x : 'T) { let foo : 'T = default }");
  parse("method nop(a : int, x : 'T) { mut foo : 'T = default; foo = x }");
  parse("method nop(a : int, x : 'T) : 'T { mut foo : 'T = default; foo = x; return foo }");
  parse("method nop(a : int, x : 'T) { function inner(y : 'B) {} }");
  parse("method first(a : int, x : list<'T>) : 'T { return x[0] }");
  parse("method first(x : list<'T>) : 'T { return x[0] }");

  // Should fail due to undeclared generic params
  assert.throws(function() {
    parse("method nop(a : int, x : int) : 'T {}");
  }, /undeclared/i);
  assert.throws(function() {
    parse("method nop(a : int, x : 'T) : 'B {}");
  }, /undeclared/i);
  assert.throws(function() {
    parse("method nop(a : int, x : 'T) : 'T { let foo : 'B = default }");
  }, /undeclared/i);
  assert.throws(function() {
    parse("method first(a : int, x : list<'T>) : 'B { return x[0] }");
  }, /undeclared/i);

  // Should fail due to redeclared generic params
  assert.throws(function() {
    parse("function nop(x : 'T) { method inner(a : int, y : 'T) {} }");
  }, /use/i);

  // Make sure types resolve properly
  assert.equal('int', calc2("method nop(a : int, x : 'T) : 'T { return x }; 1.nop(12)"));
  assert.equal('int', calc2("method first(a : int, x : list<'T>) : 'T { return x[0] }; 1.first([1])"));
  assert.equal('int', calc2("function a(x : 'T) : 'T { method b(a : int, x : 'R) : 'R { return x }; return 1.b(x) }; a(1)"));

  // Make sure access works
  parse("method halfLength(l : list<'T>) : int { return l.length / 2 }; [1, 2].halfLength()");

  test.finish();
};
