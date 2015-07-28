var mockfs = require('mock-fs')
  , types = require('../../lib/types')
  , scope = require('../../lib/scope')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  , compile = require('../../lib/api/compile')
  ;

var calc = function(str) {
  return scope.build(parser.snippet(str));
};
var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
};

test('integration', 'scope', 'basic', function() {
  var scope = calc('function foo { let a = 1; let b = 2}');

  assert.isDefined(scope.functions.foo);
  assert.equal(scope.scopes.length, 1);
  assert.equal(scope.scopes[0].parent, scope);
  assert.isDefined(scope.scopes[0].variables.a);
  assert.isDefined(scope.scopes[0].variables.b);
});

test('integration', 'scope', 'all variable declarations', function() {
  var scope = calc('let a = 1; out b = 1; mut c = 1; let d = 1');

  assert.isDefined(scope.variables.a);
  assert.isDefined(scope.variables.b);
  assert.isDefined(scope.variables.c);
});

test('integration', 'scope', 'struct', function() {
  var scope = calc('struct Foo {}');

  assert.isDefined(scope.structs.Foo);
});

test('integration', 'scope', 'nested', function() {
  var scope = calc('function foo { let a = 1; function nested { let b = 2 } }');

  assert.equal(scope.scopes.length, 1);
  assert.equal(scope.scopes[0].scopes.length, 1);
  assert.isDefined(scope.functions.foo);
  assert.isDefined(scope.scopes[0].functions.nested);
  assert.isDefined(scope.scopes[0].variables.a);
  assert.isDefined(scope.scopes[0].scopes[0].variables.b);
});

test('integration', 'scope', 'walking', function() {
  var scope = calc('struct Foo {}; function bar {}');

  var root = scope;
  assert.isDefined(root);
  assert.equal(root.search('struct', 'Foo'), scope);
  assert.isNull(root.search('function', 'notdefined'));
});

test('integration', 'scope', 'lambda', function() {
  var scope = calc('lambda(x) { return x }');

  assert.isDefined(scope);
  assert.equal(scope.scopes.length, 1);
  assert.isDefined(scope.scopes[0].variables.x);
});

test('integration', 'scope', 'conflicts', function() {
  assert.throws(function() {
    calc('let a = 1; let a = 2');
  }, /defined/);
  assert.throws(function() {
    calc('let a = 1; function a {}');
  }, /defined/);
  assert.throws(function() {
    calc('method a(i : int) {}; method a(i : int) {}');
  }, /defined/);

  // Shouldn't throw
  calc('let a = 1; method a(i : int) {}');
});

test('integration', 'scope', 'assignment block', function() {
  // Make sure these don't fail
  calc('let a = 1; struct Foo { a = 1 }; let b = new Foo { a = 1 }');
  calc('let a = 1; struct Foo { a = a }; let b = new Foo { a = a }');
  calc('struct Foo { a = 1 }; function foo(a : int) { new Foo { a = a }; }');

  // These should fail.  Note that we have to use type resolution
  // to attempt to find undeclared identifiers, as the scope module
  // doesn't handle those cases.
  assert.throws(function() {
    calc2('struct Foo { a = 1 }; new Foo { a = b }');
  }, /scope/);
  assert.throws(function() {
    calc2('struct Foo { a = 1 }; new Foo { z = 1 }');
  }, /property/);
});

test('integration', 'scope', 'loops', function() {
  var scope = calc('for i = 0 upto 10 {}');
  assert.isDefined(scope);
  assert.equal(scope.scopes.length, 1);
  assert.equal(scope.search('variable', 'i'), scope.scopes[1], 'i has correct scope');

  // Make sure loop variables don't shadow other variables
  assert.throws(function() {
    calc('let a = 1; for a = 0 upto 2 {}');
  }, /defined/i);

  // Make sure loop variables can't be shadowed
  assert.throws(function() {
    calc('for i = 0 upto 2 { let! i = 1 }');
  }, /defined/i);
  assert.throws(function() {
    calc('for i = 0 upto 2 { for k = 0 upto 2 { let! i = 1 } }');
  }, /defined/i);
});

//
// It's possible for types to end up in scope without being explicitly
// imported, if e.g. returned from a function in another module that
// *does* have the import.  This needs to work.
//
test.isolate('integration', 'scope', 'implicit import scope', function(done) {
  var main = 'import foo; function main { foo() }';
  mockfs({
    '/test/main.vgl': main,
    '/test/foo.vgl': 'import thing; export function foo : Thing { return new Thing }',
    '/test/thing.vgl': 'export struct Thing {}'
  });
  done.cleanup(function() {
    mockfs.restore();
  });

  compile(main, 'javascript', {filename: '/test/main.vgl'}, function(err, filemap, world) {
    assert.ifError(err);

    done();
  });
});
