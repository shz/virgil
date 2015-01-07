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

exports.testDefaults = function(test, assert) {
  // Just make sure these don't fail
  calc2('let a : int = default; a');
  calc2('let a : float = default; a');
  calc2('let a : str = default; a');
  calc2('let a : bool = default; a');
  calc2('let a : func<void> = default; a');
  calc2('let a : method<int, void> = default; a'); // Weird generic failure
  calc2('let a : list<bool> = default; a');
  calc2('struct Foo {}; let a : Foo = default; a');

  // Types must be defined to use default
  assert.throws(function() {
    calc2('let a = default; a');
  }, /default/);

  test.finish();
};

exports.testAssignmentAllowance = function(test, assert) {
  // Just attempt to trigger errors.  All of these are supposed to work.
  calc2('let a = 1; a');
  calc2('mut a = 1; a');
  calc2('out a = 1; a');
  calc2('mut a = 1; a = 2; a');
  calc2('mut a = 1; a = 2.0f; a');
  calc2('struct Foo { a = 1 }; let f = new Foo; f.a = 2; f.a');
  calc2('let a : list<bool> = []; a');
  calc2('function foo(x : \'T) { let a : list<\'T> = [] } foo');
  calc2('struct Foo<\'T> { a : list<\'T> = [] }; new Foo<int>.a');

  // These should fail
  assert.throws(function() {
    calc2('mut a = 1; a = "foo"; a');
  }, /mismatch/);
  assert.throws(function() {
    calc2('let a = 1; a = 2; a');
  }, /immutable/);
  assert.throws(function() {
    calc2('out a = 1; a = 2; a');
  }, /immutable/);
  assert.throws(function() {
    calc2('mut a = 1; a = void; a');
  }, /void/);
  assert.throws(function() {
    calc2('function v {}; mut a = 1; a = v(); a');
  }, /void/);

  test.finish();
};
