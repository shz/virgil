var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , JSConverter = require('../../lib/converters/javascript')
  ;

var parse = function(str) {
  var c = new JSConverter();
  return c.compile(parser.snippet(str));
};

test('unit', 'precedence', 'access', function() {
  assert.equal(parse('1 - a.b'), '1 - a.b;');
  assert.equal(parse('(1 - a.b)'), '1 - a.b;');
  assert.equal(parse('1 - (a.b)'), '1 - a.b;');
  assert.equal(parse('(1 - (a.b))'), '1 - a.b;');
  assert.equal(parse('a + b <= c + d'), 'a + b <= c + d;');
});

test('unit', 'precedence', 'arithmetic', function() {
  assert.equal(parse('1 - 2 - 3'), '1 - 2 - 3;');
  assert.equal(parse('(1 - 2) - 3'), '1 - 2 - 3;');
  assert.equal(parse('1 - (2 - 3)'), '1 - (2 - 3);');

  assert.equal(parse('1 + 2 + 3'), '1 + 2 + 3;');
  assert.equal(parse('(1 + 2) + 3'), '1 + 2 + 3;');
  assert.equal(parse('1 + (2 + 3)'), '1 + (2 + 3);');

  assert.equal(parse('1 + 2 - 3'), '1 + 2 - 3;');
});
