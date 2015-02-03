var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , js = require('./util/require')('converters/javascript')
  ;

var parse = function(str) {
  return js(parser.snippet(str));
};

exports.testAccess = function(test, assert) {
  assert.equal(parse('1 - a.b'), '1 - a.b;');
  assert.equal(parse('(1 - a.b)'), '1 - a.b;');
  assert.equal(parse('1 - (a.b)'), '1 - a.b;');
  assert.equal(parse('(1 - (a.b))'), '1 - a.b;');
  assert.equal(parse('a + b <= c + d'), 'a + b <= c + d;');

  test.finish();
};
