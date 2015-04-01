var Converter = require('../../../lib/converters/common/converter');

test('unit', 'converters', 'common', function() {
  var c = new Converter('coolname');
  assert.equal(c.name, 'coolname');
  assert.match(c.toString(), /coolname/);
  assert.match(c.inspect(), /coolname/);

  var mixin = Object.create({ blah: function() {}});
  mixin.foobar = function() {};
  assert.isUndefined(c.foobar);
  c.mixin(mixin);
  assert.isDefined(c.foobar);
  assert.isUndefined(c.blah);

  // This must be overriden by users
  assert.throws(function() {
    c.compile({ throw: function(m) { throw new Error(m) } });
  }, /converter/);
});
