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
  var result = interpreter.run(buildFunc('function main : bool { return true }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.TrueLiteral);
});

test('functional', 'interpreter', 'basic expressions', function() {
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

  result = interpreter.run(buildFunc('function main : bool { return (1 > 2) || (true && true) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.TrueLiteral);

  result = interpreter.run(buildFunc('function main : int { return 1 == 1 ? 10 : 7 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 10);
});

test('functional', 'interpreter', 'variables', function() {
  var result;

  result = interpreter.run(buildFunc('function main : int { let a = 1; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);
});

test('functional', 'interpreter', 'control flow', function() {
  var result;

  // If statement, passed
  result = interpreter.run(buildFunc('function main : int { let a = 1 + 3; if a > 1 { return 2 } else { return 5 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 2);

  // If statement, else
  result = interpreter.run(buildFunc('function main : int { let a = 1 + 3; if a > 100 { return 2 } else { return 5 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 5);

  // While loop, runs, returns 1
  result = interpreter.run(buildFunc('function main : int { while true { return 1 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  // While loop, does not run
  result = interpreter.run(buildFunc('function main : int { while false { return 1 } return 4 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 4);

  // TODO - While loop, accum
  // TODO - For loop in all its forms
});
