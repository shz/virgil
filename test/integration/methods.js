var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

test('integration', 'methods', 'Natural', function() {
  var node = parser.module('struct Foo {} ; method bar(f : Foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);
  assert.ok(node.scope.methods[0][2].nat);
});

test('integration', 'methods', 'Extern', function() {

  var node = parser.module('extern { struct Foo {} \n method barNat(f : Foo) } \n method barNoNat(f : Foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 2);
  assert.equal(node.scope.methods[0][2].nat, true);
  assert.equal(node.scope.methods[1][2].nat, false);
});

test('integration', 'methods', 'Unnatural', function() {
  var node = parser.module('struct Foo {} \n method barNat(f: Foo) {} \n function baz { method unnatBar(f : Foo){} }');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);
  assert.equal(node.scope.scopes.length, 2);
  assert.equal(node.scope.scopes[1].methods.length, 1);
  assert.equal(node.scope.scopes[1].methods[0][2].nat, false);
});

test('integration', 'methods', 'Type', function() {
  assert.equal('method<int, int>', calc2('method a(i : int) : int { return 1}; (1).a'));
  assert.equal('method<list<int>, void>', calc2('method a(l : list<int>) {}; [1].a'));
});

test('integration', 'methods', 'BuiltinTypes', function() {
  // assert.equal('method<list<int>, void>', calc2('[true].push'));
});
