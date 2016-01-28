//
// Test interpretation of Virgil ASTs
//

var ast = require('../../lib/ast')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  , interpreter = require('../../lib/interpreter')
  ;

var build = function(str) {
  var chunks = parser.snippet(str);
  var mod = new ast.Module(chunks, 'test.vgl', str);
  passes.runAll(mod);

  return mod;
};

test('functional', 'interpreter', 'basic function', function() {
  var result = interpreter.run(build('function main : bool { return true }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.TrueLiteral);
});

test('functional', 'interpreter', 'basic expressions', function() {
  var result;

  result = interpreter.run(build('function main : int { return 0 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 0);

  result = interpreter.run(build('function main : int { return -(4 + 9 % 3) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, -4);

  result = interpreter.run(build('function main : int { return [1 + 1, 7, -3][1] }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 7);

  result = interpreter.run(build('function main : bool { return (1 > 2) || (true && true) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.TrueLiteral);

  result = interpreter.run(build('function main : int { return 1 == 1 ? 10 : 7 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 10);
});

test('functional', 'interpreter', 'variables', function() {
  var result;

  result = interpreter.run(build('function main : int { let a = 1; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  result = interpreter.run(build('function main : int { mut a = 1; a = 2; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 2);

  assert.throws(function() {
    interpreter.run(build('function main : int { let a = 1; a = 2; return a }'));
  }, /immutable/);
});

test('functional', 'interpreter', 'control flow', function() {
  var result;

  // If statement, passed
  result = interpreter.run(build('function main : int { let a = 1 + 3; if a > 1 { return 2 } else { return 5 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 2);

  // If statement, else
  result = interpreter.run(build('function main : int { let a = 1 + 3; if a > 100 { return 2 } else { return 5 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 5);

  // While loop, runs, returns 1
  result = interpreter.run(build('function main : int { while true { return 1 } }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  // While loop, does not run
  result = interpreter.run(build('function main : int { while false { return 1 }; return 4 }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 4);

  // While loop, accum
  result = interpreter.run(build('function main : int { mut a = 1; while a < 5 { a = a + a }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 8);

  // While loop, break/continue
  result = interpreter.run(build('function main : int { mut a = 1; while true { a = a + 1; if a > 4 { break } else { continue } }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 5);

  // For loop, runs once
  result = interpreter.run(build('function main : int { mut a = 1; for i = 0 upto 1 { a = a + 1 }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 2);

  // For loop, runs never
  result = interpreter.run(build('function main : int { mut a = 1; for i = 0 upto 0 { a = a + 1 }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  // For loop, runs a few times
  result = interpreter.run(build('function main : int { mut a = 1; for i = 0 upto 7 { a = a + 1 }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 8);

  // For loop, returns immediately
  result = interpreter.run(build('function main : int { for i = 1 upto 2 { return i }}'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  // For loop, break/continue
  result = interpreter.run(build('function main : int { mut a = 0; for i = 0 upto 4 { a = a + 1; if a > 4 { break } else { continue } }; return a }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 5);
});

test('functional', 'interpreter', 'functions', function() {
  var result;

  // Simple function call
  result = interpreter.run(build('function a : int { return 1 }; function main : int { return a() }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 1);

  // Function call with arguments
  result = interpreter.run(build('function double(i: int) : int { return i * 2 }; function main : int { return double(2) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 4);

  // Lambda with arguments
  result = interpreter.run(build('function main : int { return (lambda (n: int) :int { return 2 * n })(2) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 4);

  // Recursion
  result = interpreter.run(build('function seq(n: int) : int { if n == 0 { return 0 }; return n + seq(n - 1) }; function main : int { return seq(5) }'));
  assert.isDefined(result);
  assert.ok(result instanceof ast.IntegerLiteral);
  assert.equal(result.value, 15);
});

test('functional', 'interpreter', 'structs', function() {
  var result;

  // Basic definition/instantiation
  result = interpreter.run(build('struct Foo { a = 13 }; function main : Foo { return new Foo }'));
  assert.isDefined(result);
  assert.ok(result.constructor.name === 'SlotList'); // Bit of a hack but meh
  assert.ok(result.get('a') instanceof ast.IntegerLiteral);
  assert.equal(result.get('a').value, 13);

  // Custom instantiation
  result = interpreter.run(build('struct Foo { a = 13; b = "yes" }; function main : Foo { return new Foo { a = 5 } }'));
  assert.isDefined(result);
  assert.ok(result.constructor.name === 'SlotList'); // Bit of a hack but meh
  assert.ok(result.get('a') instanceof ast.IntegerLiteral);
  assert.equal(result.get('a').value, 5);
  assert.ok(result.get('b') instanceof ast.StringLiteral);
  assert.equal(result.get('b').value, "yes");
});
