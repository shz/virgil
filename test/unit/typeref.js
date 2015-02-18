var types = require('../../lib/types')
  ;

test('unit', 'typeref', 'basic', function() {
  assert.isDefined(types.TypeRef);

  var tr = new types.TypeRef('int');
  assert.equal(tr.name, 'int');
  assert.equal(tr.generics.length, 0);
  assert.equal(tr.builtin, true);

  tr = new types.TypeRef('Thingy');
  assert.equal(tr.name, 'Thingy');
  assert.equal(tr.generics.length, 0);
  assert.equal(tr.builtin, false);
});

test('unit', 'typeref', 'toString()', function() {
  var tr1 = new types.TypeRef('list', ['int']);
  var tr2 = new types.TypeRef('int');

  assert.notEqual(tr1.toString(), ({}).toString());
  assert.notEqual(tr2.toString(), ({}).toString());
  assert.notEqual(tr1.toString(), tr2.toString());
});

test('unit', 'typeref', 'generic', function() {
  var tr1 = new types.TypeRef('\'A');
  var tr2 = new types.TypeRef('int');

  assert.equal(tr1.isGeneric, true);
  assert.equal(tr1.hasGenericReference(), true);
  assert.equal(tr2.isGeneric, false);
  assert.equal(tr2.hasGenericReference(), false);

  tr1 = new types.TypeRef('list', [new types.TypeRef('int')]);
  tr2 = new types.TypeRef('list', [new types.TypeRef('\'T')]);

  assert.equal(tr1.isGeneric, false);
  assert.equal(tr1.generics.length, 1);
  assert.equal(tr1.builtin, true);
  assert.equal(tr1.hasGenericReference(), false);
  assert.equal(tr2.hasGenericReference(), true);

  tr1 = new types.TypeRef('list', [new types.TypeRef('list', [new types.TypeRef('\'T')])]);

  assert.equal(tr1.isGeneric, false);
  assert.equal(tr1.generics.length, 1);
  assert.equal(tr1.builtin, true);
  assert.equal(tr1.hasGenericReference(), true);
});
