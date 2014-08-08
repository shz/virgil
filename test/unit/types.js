var types = require('./util/require')('types')
  ;

exports.testEquality = function(test, assert) {
  assert.ok(types.equal(new types.TypeRef('foo'), new types.TypeRef('foo')));
  assert.ok(types.equal(new types.TypeRef('int'), types.canned['int']));
  assert.ok(types.equal(new types.TypeRef('foo', ['bar']), new types.TypeRef('foo', ['bar'])));

  test.finish();
};
