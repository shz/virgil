var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

test('unit', 'logic', 'parsing', function() {
  // Just make sure these don't throw
  parse('true || false');
  parse('true && false');
  parse('!true');
  parse('!(true || false)');
  parse('1 > 2');
  parse('1 >= 2');
  parse('1 < 2');
  parse('1 <= 2');
  parse('true ? 1 : 2');
  parse('!true ? 1 : 2');

  assert.throws(function() {
    parse('true ? 1 1');
  }, /expected/i);
});

test('unit', 'logic', 'types', function() {
  assert.equal('bool', calc('true'));
  assert.equal('bool', calc('false'));
  assert.equal('bool', calc('!true'));
  assert.equal('bool', calc('1 > 2'));
  assert.equal('bool', calc('1 >= 2'));
  assert.equal('bool', calc('1 < 2'));
  assert.equal('bool', calc('1 <= 2'));
  assert.equal('int', calc('true ? 1 : 2'));
  assert.equal('int', calc('0 || 1'));
  assert.equal('bool', calc('true && false'));
});

