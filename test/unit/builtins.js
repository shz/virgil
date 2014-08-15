var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

exports.testListMembers = function(test, assert) {
  assert.equal('int', calc2('[1, 2, 3].length'));
  // assert.equal('void', calc2('[1, 2, 3].empty()'));
  assert.throws(function() {
    assert.ok(types.equal(types.make('int'), calc2('[1, 2, 3].foobam')));
  });
  // assert.throws(function() {
  //   assert.ok(types.equal(types.make('int'), calc2('[1, 2, 3].foobam()')));
  // });

  test.finish();
};
