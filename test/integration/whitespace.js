var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , scope = require('../../lib/scope')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

test('integration', 'whitespace', 'block newlines', function() {
  // Just make sure these work
  parse('function foo { let a = 1; let b = 2 }');
  parse('new Foo { a = 1 }');
  parse('function foo { new Foo }');
  parse('struct Foo { }; function foo { new Foo { a = 1 } }');
  parse('function foo (a : int) {}');
  parse('function foo(a : int) { new Foo { a = a }; }');
});

test('integration', 'whitespace', 'method chaining', function() {
  // Just make sure these work without throwing
  parse('let a = foo().bar().baz()');
  parse('let a = foo().bar().\n   baz()');

  assert.throws(function() {
    parse('let a = foo().bar()\n.baz()');
  }, /unexpected/i);
});

test('integration', 'whitespace', 'arithmetic', function() {
  // Just make sure these work without throwing
  parse('let a = 1 + 2 / 3');
  parse('let a = 1+2/3');
  parse('let a = 1+\n2/3');
  parse('let a = 1+\n   2/3');

  assert.throws(function() {
    parse('let a = 1\n+2\n/3');
  }, /unexpected/i);
});

test('integration', 'whitespace', 'line continuations', function() {
  parse('let a = 1 \\\n    + 2\\\n/3');
});

test('integration', 'whitespace', 'statement termination', function() {
  parse('let a = 1; let b = 2');
  parse('let a = 1\n let b = 2');
  parse('if (true) { let b = 1 } else { let b = 2 }; let c = 1');

  assert.throws(function() {
    parse('let a = 1 let b = 2')
  }, /terminate/);
  assert.throws(function() {
    parse('let a = 1;\n; let b = 2');
  }, /superfluous/i);
  assert.throws(function() {
    parse('let a = 1\n;\n let b = 2');
  }, /superfluous/i);
});

test('integration', 'whitespace', 'return statement', function() {
  parse('function a: int { return 1 > 5 ? true : false }');

  return; // tmp

  parse('function a {}');
  parse('function a: bool { return true }');
  parse('function a { return }');
  parse('function a {\n return \n}');
  parse('function a: bool {\n return true \n}');
  parse('function a { return void }'); // Deprecated, but still works

  assert.throws(function() {
    parse('function a: bool { return \n true }');
  }, /expected/);
});
