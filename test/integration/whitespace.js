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
  parse('let a = foo().bar().\nbaz()');
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
