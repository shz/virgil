var converter = require('../../util/require')('converters/javascript')
  , scope = require('../../util/require')('scope')
  , parser = require('../../util/require')('parser')
  ;

var calc = function(str) {
  var ast = parser.snippet(str);
  scope.build(ast, true);
  return ast;
};

var convert = function(str) {
  return converter(calc(str));
};

exports.testVariableRenaming = function(test, assert) {
  // Make sure loop variables are renamed
  assert.match(convert('let a = 1; for a = 0 upto 1 {}'), /a[\s\S]*a1/);

  // Make sure shadowed variables aren't renamed superfluously
  assert.match(convert('let a = 1; function test { let! a = 2 }'), /a\s[\s\S]*a\s/);

  // Make sure shadowed variables outside function scope ARE renamed
  assert.match(convert('let a = 1; for i = 0 upto 1 { let! a = 2 }'), /a[\s\S]*a1/);

  test.finish();
};
