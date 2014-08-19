var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

exports.testNatural = function(test, assert) {
  var node = parser.module('struct Foo {} ; method bar(f : foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);
  assert.ok(node.scope.methods[0][2].nat);

  test.finish();
};

exports.testExtern = function(test, assert) {
  var node = parser.module('extern { struct Foo {} ; method bar(f : Foo) } ; method barNoNat(f : Foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);
  assert.equal(node.scope.methods[0][2].nat, false);

  assert.equal(node.scope.scopes.length, 1);
  assert.equal(node.scope.scopes[0].methods.length, 1);
  assert.equal(node.scope.scopes[0].methods[0][2].nat, true);

  test.finish();
};

exports.testUnnatural = function(test, assert) {
  var node = parser.module('struct Foo {} ; function baz { method bar(f : foo) {} }');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 0);

  assert.equal(node.scope.scopes.length, 2);
  assert.equal(node.scope.scopes[1].methods.length, 1);
  assert.equal(node.scope.scopes[1].methods[0][2].nat, false);

  test.finish();
};
