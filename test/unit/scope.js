var types = require('./util/require')('types')
  , scope = require('./util/require')('scope')
  , parser = require('./util/require')('parser')
  ;

var calc = function(str) {
  return scope.build(parser.snippet(str));
};

exports.testBasic = function(test, assert) {
  var scope = calc('function foo { let a = 1; let b = 2}');

  assert.isDefined(scope.functions.foo);
  assert.equal(scope.scopes.length, 1);
  assert.equal(scope.scopes[0].parent, scope);
  assert.isDefined(scope.scopes[0].variables.a);
  assert.isDefined(scope.scopes[0].variables.b);

  test.finish();
};

exports.testAllVariableDeclarations = function(test, assert) {
  var scope = calc('let a = 1; out b = 1; mut c = 1; let d = 1');

  assert.isDefined(scope.variables.a);
  assert.isDefined(scope.variables.b);
  assert.isDefined(scope.variables.c);

  test.finish();
};

exports.testStruct = function(test, assert) {
  var scope = calc('struct Foo {}');

  assert.isDefined(scope.structs.Foo);

  test.finish();
};

exports.testNested = function(test, assert) {
  var scope = calc('function foo { let a = 1; function nested { let b = 2 } }');

  assert.equal(scope.scopes.length, 1);
  assert.equal(scope.scopes[0].scopes.length, 1);
  assert.isDefined(scope.functions.foo);
  assert.isDefined(scope.scopes[0].functions.nested);
  assert.isDefined(scope.scopes[0].variables.a);
  assert.isDefined(scope.scopes[0].scopes[0].variables.b);

  test.finish();
};

exports.testWalking = function(test, assert) {
  var scope = calc('struct Foo {}; function bar {}');

  var root = scope.scopes[0];
  assert.isDefined(root);
  assert.equal(root.search('struct', 'Foo'), scope);
  assert.isNull(root.search('function', 'notdefined'));

  test.finish();
};
