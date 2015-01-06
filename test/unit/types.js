var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var calc = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  // return types.calculate(parsed[parsed.length - 1]).toString();
};

exports.testEquality = function(test, assert) {
  assert.ok(types.equal(new types.TypeRef('foo'), new types.TypeRef('foo')));
  assert.ok(types.equal(new types.TypeRef('int'), types.canned['int']));
  assert.ok(types.equal(new types.TypeRef('foo', ['bar']), new types.TypeRef('foo', ['bar'])));

  test.finish();
};

exports.testDefinitions = function(test, assert) {
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
  }, /defined/);
  assert.throws(function() {
    calc('let a = new B');
  }, /defined/);

  test.finish();
};

exports.testArithmetic = function(test, assert) {
  assert.throws(function() {
    calc('function a : int { return 1 + "string" }');
  }, /numeric/);

  test.finish();
};

exports.testReturn = function(test, assert) {
  // Make sure return statements get walked
  assert.throws(function() {
    calc('function a : int { "string" }');
  }, /(ret)(urn)/); // Chopped up to not break my syntax highlighter...

  // Make sure property lookup correctly fails on void tpes
  assert.throws(function() {
    calc('function a {}; a().b');
  }, /void/);

  test.finish();
};
