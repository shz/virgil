var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  , tokenizer = require('./util/require')('parser/tokenizer')
  ;

var parse = function(str) {
  return parser.snippet(str);
};

var tokens = function() {
  var args = Array.prototype.slice.call(arguments);
  var assert = args.shift();
  var str = args.shift();

  var t = tokenizer(str);
  assert.equal(t.length - 2, args.length);
  for (var i=0; i<t.length-2; i++)
    assert.equal(t[i][0], args[i]);
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

exports.testErrors = function(test, assert) {
  var err = null;
  try {
    var a = tokenizer('%$#^');
  } catch (e) {
    err = e;
  }

  assert.isDefined(err);
  assert.isDefined(err.start);
  assert.isDefined(err.end);
  assert.type(err.start.line, 'number');
  assert.type(err.start.col, 'number');
  assert.type(err.end.line, 'number');
  assert.type(err.end.col, 'number');

  test.finish();
};

exports.testWhitespace = function(test, assert) {
  tokens(assert, 'let i = 0\nlet  i2=1',
    'let', 'whitespace', 'identifier', 'whitespace', '=', 'whitespace', 'int',
    'newline',
    'let', 'whitespace', 'identifier', '=', 'int'
  );

  tokens(assert, 'let\ni=0\\\nlet a=1',
    'let', 'newline', 'identifier', '=', 'int',
    'let', 'whitespace', 'identifier', '=', 'int'
  );

  tokens(assert, 'let i=0; let a=2.0',
    'let', 'whitespace', 'identifier', '=', 'int', ';', 'whitespace',
    'let', 'whitespace', 'identifier', '=', 'float'
  );

  test.finish();
};
