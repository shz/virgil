var converter = require('../../../../lib/converters/javascript')
  , scope = require('../../../../lib/scope')
  , parser = require('../../../../lib/parser')
  ;

var calc = function(str) {
  var ast = parser.snippet(str);
  scope.build(ast, true);
  return ast;
};

var convert = function(str) {
  return converter(calc(str));
};

test('unit', 'converters', 'javascript', 'scope', 'variable renaming', function() {
  // Make sure shadowed variables aren't renamed superfluously
  assert.match(convert('let a = 1; function test { let! a = 2 }'), /a\s[\s\S]*a\s/);
  assert.match(convert('let a = 1; let b = lambda { let! a = 1 }'), /a\s[\s\S]*a\s/);
  assert.match(convert('let a = 1; method test(z : int) { let! a = 1 }'), /a\s[\s\S]*a\s/);

  // Make sure shadowed variables outside function scope ARE renamed
  assert.match(convert('let a = 1; for i = 0 upto 1 { let! a = 2 }'), /a[\s\S]*a\$1/);

  // Make sure renamed variables are accessed by the corrent name
  assert.match(convert('let z = 1; for i = 0 upto 1 { mut! z = 2; z = 4 }'), /z\$1[\s\S]*z\$1/);
});


test('unit', 'converters', 'javascript', 'scope', 'unnatural method renaming with generics', function() {
  assert(convert("export method bar(foo:Foo) {}").indexOf('bar$Foo') >= 0);

  // Angle braces, quot, and commas convert to underscores
  assert(convert("export method bar(foo:Foo<'B>) {}").indexOf('bar$Foo__B_') >= 0);
  assert(convert("export method bar(foo:Foo<'B,'T>) {}").indexOf('bar$Foo__B__T_') >= 0);

  // Spaces between types get dropped
  assert(convert("export method bar(foo:Foo<'B, 'T>) {}").indexOf('bar$Foo__B__T_') >= 0);
  assert(convert("export method bar(foo:Foo<Strukt, Strukt2>) {}").indexOf('bar$Foo_Strukt_Strukt2') >= 0);

  // Other parameters don't count in naming
  assert(convert("export method bar(foo:Foo<'B, 'T>, garply:int) {}").indexOf('bar$Foo__B__T') >= 0);
});
