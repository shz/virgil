var types = require('./util/require')('types')

exports.testBasic = function(test, assert) {
  assert.isDefined(types.TypeRef);

  var tr = new types.TypeRef('int');
  assert.equal(tr.name, 'int');
  assert.length(tr.generics, 0);

  test.finish();
};

exports.testToString = function(test, assert) {
  var tr1 = new types.TypeRef('list', ['int']);
  var tr2 = new types.TypeRef('int');

  assert.notEqual(tr1.toString(), ({}).toString());
  assert.notEqual(tr2.toString(), ({}).toString());
  assert.notEqual(tr1.toString(), tr2.toString());

  test.finish();
};
