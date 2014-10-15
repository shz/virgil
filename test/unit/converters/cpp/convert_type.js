var convert = require('../../util/require')('converters/cpp/convert_type')
  , types = require('../../util/require')('types')
  ;

var conv = function(s, generics, context) {
  if (typeof generics == 'string') {
    context = generics;
    generics = [];
  }

  var t = types.canned[s] || new types.TypeRef(s, generics.map(function(s) {
    return new types.TypeRef(s);
  }));
  var g = {libIncludes: {}};

  return convert(t, context, g);
};

exports.testForcedStack = function(test, assert) {
  // These guys are forced to stack mode
  assert.equal(conv('int', 'heap'), 'int');
  assert.equal(conv('float', 'heap'), 'double');
  assert.equal(conv('bool', 'heap'), 'bool');
  assert.equal(conv('void', 'heap'), 'void');
  assert.equal(conv('str', 'heap'), 'std::string');
  assert.equal(conv('func', ['int'], 'heap'), 'std::function<int()>');
  assert.equal(conv('\'T', 'heap'), 'T');

  // These are not
  assert.equal(conv('list', ['int'], 'heap'), 'std::shared_ptr<std::vector<int>>');
  assert.equal(conv('Foobar', 'heap'), 'std::shared_ptr<Foobar>');

  // Slightly more complex case
  assert.equal(conv('func', ['Foobar'], 'heap'), 'std::function<std::shared_ptr<Foobar>()>');
  assert.equal(conv('list', ['Foobar'], 'heap'), 'std::shared_ptr<std::vector<std::shared_ptr<Foobar>>>');

  test.finish();
};
