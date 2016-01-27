var ast = require('../../lib/ast');

test('unit', 'ast', 'core', function() {
  // Make sure the base stuff isn't directly instantiable
  assert.throws(function() {
    new ast.Node();
  }, /subclass/);
  assert.throws(function() {
    new ast.Statement();
  }, /subclass/);
  assert.throws(function() {
    new ast.Expression();
  }, /subclass/);

  var node = new ast.StringLiteral('hi mom');
  node.loc = { start: {col: 1, line: 1}, end: { col: 1, line: 2} };
  assert.match(node.repr(), 'StringLiteral');
  assert.throws(function() {
    node.throw('custom error');
  }, /custom/);

  var err = null;
  try {
    node.throw('error');
  } catch (e) { err = e; }
  assert.equal(err.message, 'error');
  assert.isDefined(err.loc);
  assert.isDefined(err.loc.start);
  assert.isDefined(err.loc.end);

  err = node.error('error');
  assert.equal(err.message, 'error');
  assert.isDefined(err.loc);
  assert.isDefined(err.loc.start);
  assert.isDefined(err.loc.end);
});

test('unit', 'ast', 'core', 'deepEqual', function() {
  var a = new ast.IntegerLiteral(10);
  a.loc = {foo: 'bar'};
  assert.equal(a.deepEqual(a), true);
  assert.equal(a.deepEqual(new ast.IntegerLiteral(10)), true);
  assert.equal(a.deepEqual(null), false);
  assert.equal(a.deepEqual(new ast.IntegerLiteral(9)), false);
  assert.equal(a.deepEqual(new ast.FloatLiteral(10)), false);

  a = new ast.BlockStatement(null, [new ast.IntegerLiteral(10)]);
  assert.equal(a.deepEqual(a), true);
  assert.equal(a.deepEqual(new ast.BlockStatement(null, [new ast.IntegerLiteral(10)])), true);
  assert.equal(a.deepEqual(new ast.BlockStatement(null, [new ast.IntegerLiteral(9)])), false);
  assert.equal(a.deepEqual(new ast.BlockStatement(null, [new ast.IntegerLiteral(10), new ast.IntegerLiteral(9)])), false);

  a = new ast.BlockStatement(null, [null, new ast.IntegerLiteral(1)]);
  assert.equal(a.deepEqual(new ast.BlockStatement(null, [new ast.IntegerLiteral(1), null])), false);

  a = new ast.BlockStatement(null, [new ast.IntegerLiteral(1), null]);
  assert.equal(a.deepEqual(new ast.BlockStatement(null, [null, new ast.IntegerLiteral(1)])), false);
});

test('unit', 'ast', 'literals', function() {
  // Make sure the base stuff isn't directly instantiable
  assert.throws(function() {
    new ast.Literal();
  }, /subclass/);
  assert.throws(function() {
    new ast.NumericLiteral();
  }, /subclass/);

  var l = null;

  // Strings
  "\""
  l = new ast.StringLiteral('foo');
  assert.equal(l.value, 'foo');
  l = new ast.StringLiteral('\\"');
  assert.equal(l.value, '"');
  l = new ast.StringLiteral('foo\\"');
  assert.equal(l.value, 'foo"');
  l = new ast.StringLiteral('\\"foo');
  assert.equal(l.value, '"foo');
  l = new ast.StringLiteral('foo\\t\\r\\n\\\\\\"');
  assert.equal(l.value, 'foo\t\r\n\\"');
  l = new ast.StringLiteral('foo\\t\\r\\n\\\\\\"', true);
  assert.equal(l.value, 'foo\\t\\r\\n\\\\\\"');
  assert.throws(function() {
    new ast.StringLiteral('foo\\z');
  }, /escape/);
  assert.throws(function() {
    new ast.StringLiteral('hello\\ ');
  }, /whitespace/);

  // Ints
  l = new ast.IntegerLiteral(10);
  assert.equal(l.value, 10);
  l = new ast.IntegerLiteral('10');
  assert.equal(l.value, 10);
  l = new ast.IntegerLiteral('010');
  assert.equal(l.value, 10);
  l = new ast.IntegerLiteral('100.1');
  assert.equal(l.value, 100);

  // Floats
  l = new ast.FloatLiteral(100.1);
  assert.equal(l.value, 100.1);
  l = new ast.FloatLiteral('100.1');
  assert.equal(l.value, 100.1);
  l = new ast.FloatLiteral('100');
  assert.equal(l.value, 100);
});
