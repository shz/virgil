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

exports.testFunctionAssignment = function(test, assert) {
  assert.equal('int', calc2('function a : int { return 1 } ; let b = a() ; b'));
  assert.throws(function() {
    calc2('function a { } ; let b = a()');
  }, /void/);
  assert.throws(function() {
    calc2('function a {} ; mut b = 1 ; b = a() ; b');
  }, /void/);

  test.finish();
};
