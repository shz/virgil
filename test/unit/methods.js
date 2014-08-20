var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

exports.testNatural = function(test, assert) {
  var node = parser.module('struct Foo {} ; method bar(f : Foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);
  assert.ok(node.scope.methods[0][2].nat);   // <<< FAILING:  same scope as obj but not externed: nat == true

  test.finish();
};


// All externed methods are natural.
// But: A non-externed method that is defined at same scope as its externed "owner struct" is unnatural.
exports.testExtern = function(test, assert) {

  var node = parser.module('extern { struct Foo {} \n method barNat(f : Foo) } \n method barNoNat(f : Foo) {}');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 2);
  assert.equal(node.scope.methods[0][2].nat, true);
  assert.equal(node.scope.methods[1][2].nat, false);

  test.finish();
};



// A method that is not defined at same scope as its "owner struct" is unnatural.
exports.testUnnatural = function(test, assert) {
  var node = parser.module('struct Foo {} \n method barNat(f: Foo){} \n function baz { \n method unnatBar(f : Foo){} \n }');
  passes.runAll(node);

  assert.equal(node.scope.methods.length, 1);

  assert.equal(node.scope.scopes.length, 2);
  assert.equal(node.scope.scopes[1].methods.length, 1);
  assert.equal(node.scope.scopes[1].methods[0][2].nat, false);

  test.finish();
};
