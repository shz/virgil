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

exports.testStrings = function(test, assert) {
  var a = parse('let a = "this # has a hash"');
  assert.equal(a.length, 1);
  assert.equal(a[0].constructor.name, 'VariableDeclaration');
  assert.equal(a[0].expression.constructor.name, 'StringLiteral');
  assert.equal(a[0].expression.value, 'this # has a hash');

  var b = parse('let a = "this is a \\" string"');
  assert.equal(b.length, 1);
  assert.equal(b[0].constructor.name, 'VariableDeclaration');
  assert.equal(b[0].expression.constructor.name, 'StringLiteral');
  assert.equal(b[0].expression.value, 'this is a " string');

  var c = parse('let c = "\\"abc"');
  assert.equal(c.length, 1);
  assert.equal(c[0].expression.value, '"abc');

  var d = parse('let d = "xyz\\""');
  assert.equal(d.length, 1);
  assert.equal(d[0].expression.value, 'xyz"');

  test.finish();
};
