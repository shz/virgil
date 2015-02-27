var regex = require('../../../lib/tokenizer/regex');

test('unit', 'tokenizer', 'regex', 'exports', function() {
  assert.ok(regex.parts instanceof Array);
  assert.type(regex.source, 'string');
  assert.type(regex.create, 'function');
});

test('unit', 'tokenizer', 'regex', 'create', function() {
  var re = regex.create();
  assert.ok(re instanceof RegExp);
});
