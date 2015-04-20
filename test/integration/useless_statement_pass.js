var types = require('../../lib/types')
  , scope = require('../../lib/scope')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var calc = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
};

test('integration', 'useless statement pass', function() {
  // This should work
  calc('function foo { foo() }');

  // This should fail
  var err;
  try {
    calc('function foo { foo }');
  } catch (e) {
    err = e;
  }

  assert.isDefined(err);
  assert.match(err.message, /statement/i);
  assert.isDefined(err.loc);
});
