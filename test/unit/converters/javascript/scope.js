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
