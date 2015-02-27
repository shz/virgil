var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var calc = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  // return types.calculate(parsed[parsed.length - 1]).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

test('integration', 'types', 'equality', function() {
  assert.ok(types.equal(new types.TypeRef('foo'), new types.TypeRef('foo')));
  assert.ok(types.equal(new types.TypeRef('int'), types.canned['int']));
  assert.ok(types.equal(new types.TypeRef('foo', ['bar']), new types.TypeRef('foo', ['bar'])));
});

test('integration', 'types', 'null equality', function() {
  assert.ok(types.equal(new types.TypeRef('null'), types.canned['null']));
  assert.ok(!types.equal(new types.TypeRef('int'), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('func', ['int']), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('Shazam'), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('\'T'), types.canned['null']));
});

test('integration', 'types', 'definitions', function() {
  // Just make sure there's don't fail
  calc('let a : int = 1');
  calc('let a : float = 1');
  calc('let a : bool = true');
  calc('let a : str = "hi"');
  calc('let a : func<void> = null');

  // Void cannot be used as a type
  assert.throws(function() {
    calc('let a : void = null');
  }, /void/);

  // References to user types should work
  calc('struct A {}; let a : A = null');

  // References to undefined user types should fail
  assert.throws(function() {
    calc('let a : b = null');
  }, /b/);
  assert.throws(function() {
    calc('let a = new B');
  }, /B/);
});

test('integration', 'types', 'arithmetic',  function() {
  assert.throws(function() {
    calc('function a : int { return 1 + "string" }');
  }, /numeric/);
});

test('integration', 'types', 'return', function() {
  // Make sure return statements get walked
  assert.throws(function() {
    calc('function a : int { "string" }');
  }, /(ret)(urn)/); // Chopped up to not break my syntax highlighter...

  // Make sure property lookup correctly fails on void tpes
  assert.throws(function() {
    calc('function a {}; a().b');
  }, /void/);
});

test('integration', 'types', 'lambda types optional', function() {
  // Ensure these don't throw
  calc('function a(f : func<int, void>) {}; a(lambda(i) {})');
  calc('function b(f : func<int>) {}; b(lambda { return 1 })');
  calc('function d(f : func<int, void>) {}; d(lambda(i) { i + 1 })');

  // In cases where we can't infer the type, it should bail
  assert.throws(function() {
    calc('let a = lambda(b) {}');
  }, /type/i);

  // We don't support this shorthand for variable assignment
  assert.throws(function() {
    calc('let a : func<int, void> = lambda(i) {}');
  }, /type/i);

  // Make sure argument number is enforced
  assert.throws(function() {
    calc('function c(f : func<int>) {}; c(lambda { return "hi" })');
  }, /type/i);

  // Make sure argument types are not explicitly wrong
  assert.throws(function() {
    calc('function c(f : func<int, void>) {}; c(lambda(s : str) { })');
  }, /type/i);
});
