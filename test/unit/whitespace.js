var types = require('./util/require')('types')
  , scope = require('./util/require')('scope')
  , parser = require('./util/require')('parser')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

exports.testBlockNewlines = function(test, assert) {
  // Just make sure these work
  parse('function foo { let a = 1; let b = 2 }');
  parse('new Foo { a = 1 }');
  parse('function foo { new Foo }');
  parse('struct Foo { }; function foo { new Foo { a = 1 } }');
  parse('function foo (a : int) {}');
  parse('function foo(a : int) { new Foo { a = a }; }');

  test.finish();
};

exports.testMethodChaining = function(test, assert) {
  // Just make sure these work without throwing
  parse('let a = foo().bar().baz()');
  parse('let a = foo().bar().\nbaz()');
  parse('let a = foo().bar().\n   baz()');

  assert.throws(function() {
    parse('let a = foo().bar()\n.baz()');
  }, /unexpected/i);

  test.finish();
};

exports.testArithmetic = function(test, assert) {
  // Just make sure these work without throwing
  parse('let a = 1 + 2 / 3');
  parse('let a = 1+2/3');
  parse('let a = 1+\n2/3');
  parse('let a = 1+\n   2/3');

  assert.throws(function() {
    parse('let a = 1\n+2\n/3');
  }, /unexpected/i);

  test.finish();
};

exports.testLineContinuations = function(test, assert) {
  parse('let a = 1 \\\n    + 2\\\n/3');

  test.finish();
};
