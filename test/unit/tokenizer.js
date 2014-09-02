var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

exports.testSuperflousSemicolon = function(test, assert) {
  parse('let a = 1; let b = 2');

  assert.throws(function() {
    parse('let a = 1;\nlet b = 2');
  }, /semicolon/i);

  test.finish();
};
