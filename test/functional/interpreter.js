//
// Test interpretation of Virgil ASTs
//

var ast = require('../../lib/ast')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  , interpreter = require('../../lib/interpreter')
  ;

var buildFunc = function(str) {
  var ast = parser.snippet(str)[0];
  passes.runAll(ast);
  return ast;
};

test('functional', 'interpreter', 'basic function', function() {
  var result;

  result = interpreter.run(buildFunc('function main : int { return 0 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 0);

  result = interpreter.run(buildFunc('function main : int { return -(4 + 9 % 3) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, -4);

  result = interpreter.run(buildFunc('function main : int { return [1 + 1, 7, -3][1] }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 7);
});

test('functional', 'interpreter', 'variables', function() {
  var result;

  result = interpreter.run(buildFunc('function main : int { let a = 1; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);
});
