var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var parse = function(str) {
  passes.runAll(parser.snippet(str));
};

exports.testExternMethodLegality = function(test, assert) {
  assert.throws(function() {
    parse('extern { method foo (s : str) }');
  }, /extern/);
  assert.throws(function() {
    parse('extern { struct C {} }; extern { method foo (s : C) }');
  }, /extern/);

  // Make sure this doesn't throw
  parse('extern { struct C {}; method foo (c : C) }');

  test.finish();
};
