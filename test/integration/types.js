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
  assert.ok(types.equal(new types.TypeRef('list', [new types.TypeRef('int')]), types.canned['null']));
  assert.ok(!types.equal(new types.TypeRef('int'), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('func', ['int']), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('Shazam'), types.canned['null']));
  assert.ok(!types.equal(new types.TypeRef('\'T'), types.canned['null']));
  assert.ok(types.equal(new types.TypeRef('func', ['int']), types.canned['null']));
});

test('integration', 'types', 'definitions', function() {
  // Just make sure there's don't fail
  calc('let a: int = 1');
  calc('let a: float = 1');
  calc('let a: bool = true');
  calc('let a: str = "hi"');
  calc('let a: func<void> = null');
  calc('let a: list<int> = []');
  calc('let a : datetime = default');
  calc('let a : datetime = null');
  calc('let a : datetime = new datetime');
  calc('let a : datetime = new datetime { ts = 1 offset = -60*60*5 }');

  // Void cannot be used as a type
  assert.throws(function() {
    calc('let a : void = null');
  }, /void/);

  // Cannot use 'new' to create a built-in type (with one exception: datetime)
  assert.throws(function() {
    calc('let a : str = new str');
  }, /new.*str/);

  // Validate known members of the one built-in for which "new" is supported
  assert.throws(function() {
    calc('let a : datetime = new datetime { notknown = 3 }');
  }, /no property.*notknown/);

  // Validate types on members of the one built-in for which "new" is supported
  assert.throws(function() {
    calc('let a : datetime = new datetime { ts = 3f }');
  }, /type int.*float/);

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

test('integration', 'types', 'nulls in struct definition', function() {
  // primitives can't be null
  assert.throws(function() {
    calc('struct A { b:int = null }');
  }, /null/);
  assert.throws(function() {
    calc('struct A { b:float = null }');
  }, /null/);
  assert.throws(function() {
    calc('struct A { b:bool = null }');
  }, /null/);
  assert.throws(function() {
    calc('struct A { b:str = null }');
  }, /null/);

  // structs, lists, funcs can be null
  assert.ok(function() {
    calc('struct B {}; struct A { b:B = null }');
  });
  assert.ok(function() {
    calc('struct A { b:func<void> = null }');
  });
  assert.ok(function() {
    calc('struct A { b:list<int> = null }');
  });

  // generics can't be null
  assert.throws(function() {
    calc("struct A<'T> { b:'T = null }");
  }, /null/);

  // Combination pizza
  assert.ok(function() {
    calc(["struct Foo<'T> {",
      "a: 'T = default",
      "b: list<'T> = null",
      "c: list<'T> = []",
      "}"
    ].join("\n"));
  });
});

//test('integration', 'types', 'inferring with generics')

test('integration', 'types', 'arithmetic', function() {
  assert.throws(function() {
    calc('function a : int { return 1 + "string" }');
  }, /numeric/);

  calc('function a : float { return 20f + (1f < 2f) ? 1f : 2f }');
});

test('integration', 'types', 'logic', function() {
  // Make sure these work
  calc('function a: bool { return 100 > 1 }');
  calc('function a: bool { return 100 == 101 }');
  calc('function a: bool { return "bar" == "bar" }');
  calc('function a: bool { return !!true }');

  assert.throws(function() {
    calc('function a: bool { return "foo" == 100 }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return 100f == 100 }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return true == 100 }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return true == 100 }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return 100 > "zoink" }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return 100 > true }');
  }, /type/i);
  assert.throws(function() {
    calc('function a: bool { return !100 }');
  }, /bool/i);
  assert.throws(function() {
    calc('function a: bool { return !"wat" }');
  }, /bool/i);
  assert.throws(function() {
    calc('function a: bool { return "this" > "that" }');
  }, /type/);
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

test('integration', 'types', 'list inferrence', function() {
  // Make sure these work
  calc('function a(l: list<list<int>>) { l.push([]) }');
  calc('function a: list<int> { return [] }');
});

test('integration', 'types', 'lambda types optional', function() {
  // Ensure these don't throw
  calc('function a(f : func<int, void>) {}; a(lambda(i) {})');
  calc('function b(f : func<int>) {}; b(lambda { return 1 })');
  calc('function d(f : func<int, void>) {}; d(lambda(i) { i + 1 })');
  calc('function test(l: list<\'T>, f: func<\'T, int, void>) { f(l[0], 1) };' +
       'test([1, 2, 3], lambda(x, i) { x + i * 2 })');
  calc('method test(l: list<\'T>, f: func<\'T, int, void>) { f(l[0], 1) };' +
       '[1, 2, 3].test(lambda(x, i) { x + i * 2 })');
  calc("struct Foo<'A, 'B> { a: 'A = default b: 'B = default };" +
       "method test(foo: Foo<'A, 'B>, f: func<Foo<'A, 'B>, void>) {};" +
       "(new Foo<int, int>).test(lambda(x) { x.a + x.b })");
  calc("struct Foo<'A, 'B> { a: 'A = default b: 'B = default };" +
       "function test(foo: Foo<'A, 'B>, f: func<Foo<'A, 'B>, void>) {};" +
       "test(new Foo<int, int>, lambda(x) { x.a + x.b })");

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

test('integration', 'types', 'list inference', function() {
  calc('mut a: list<int> = null; a = []');
});
