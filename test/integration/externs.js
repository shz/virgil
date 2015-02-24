var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var parse = function(str) {
  passes.runAll(parser.snippet(str));
};

test('integration', 'externs', 'method legality', function() {
  assert.throws(function() {
    parse('extern { method foo (s : str) }');
  }, /extern/);
  assert.throws(function() {
    parse('extern { struct C {} }; extern { method foo (s : C) }');
  }, /extern/);

  // Make sure this doesn't throw
  parse('extern { struct C {}; method foo (c : C) }');
});
