var types = require('./util/require')('types')
  , scope = require('./util/require')('scope')
  , parser = require('./util/require')('parser')
  ;

var calc = function(str) {
  return scope.build(parser(str)[0]);
};

// exports.testBasic = function(test, assert) {
//   var scope = calc('function foo { let a = 1; let b = 2}');

//   assert.isDefined(scope.variables.a);
//   assert.isDefined(scope.variables.b);

//   test.finish();
// };

// exports.testBasic = function(test, assert) {
//   var scope = calc('function foo { let a = 1; function nested { let b = 2 } }');

//   assert.isDefined(scope.variables.a);
//   assert.isDefined(scope.functions.nested);
//   assert.equal(scope.scopes.length, 1);
//   assert.isDefined(scope.scopes[0].variables.b);

//   test.finish();
// };
