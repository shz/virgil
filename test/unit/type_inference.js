var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var calc = function(str) {
  return types.calculate(parser.statement(str)).toString();
};

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};

test('unit', 'type inference', 'direct', function() {
  assert.equal('bool', calc('true'));
  assert.equal('bool', calc('false'));
  assert.equal('int', calc('1'));
  assert.equal('int', calc('174'));
  assert.equal('float', calc('1f'));
  assert.equal('float', calc('1.0'));
  assert.equal('str', calc('"blah blah blah"'));
});

test('unit', 'type inference', 'arithmetic', function() {
  assert.equal('int', calc('1 + 1'));
  assert.equal('str', calc('"hi" + "bye"'));
  assert.equal('float', calc('1.0 + 2.0'));
  assert.equal('float', calc('1.0 + 2f'));

  assert.equal('int', calc('1 - 1'));
  assert.equal('int', calc('1 * 1'));
  assert.equal('int', calc('1 / 1'));
  assert.equal('int', calc('1 % 1'));
  assert.equal('int', calc('1 ** 1'));
  assert.equal('float', calc('1f ** 2'));

  assert.throws(function() {
    calc('"hi" * "bye"');
  }, /type/);
  assert.throws(function() {
    calc('true + false');
  }, /type/);
  assert.throws(function() {
    calc('1.0 + 2');
  }, /type/);
  assert.throws(function() {
    calc('"foo" ** 1');
  }, /left/i);
  assert.throws(function() {
    calc('10 ** 1.4');
  }, /right/i);
});

test('unit', 'type inference', 'binary', function() {
  assert.equal('int', calc('1 || 2'));
  assert.equal('func<int>', calc('lambda : int { return 1 } || lambda : int { return 0 }'));
});

test('unit', 'type inference', 'ternary', function() {
  assert.equal('int', calc('true ? 1 : 2'));
  assert.throws(function() {
    calc('true ? 1 : "hi"');
  });
});

test('unit', 'type inference', 'list expression', function() {
  assert.equal('list<int>', calc('[1, 2, 3]'));
  assert.equal('list<float>', calc('[1.0f, 1.0]'));
  assert.equal('list<str>', calc('["foo", "bar"]'));
  assert.equal('list<list<int>>', calc('[[1, 2], [1]]'));
  assert.equal('int', calc('[1, 2, 3][1]'));
  assert.equal('inferred', calc('[]'));

  assert.throws(function() {
    calc('[1, 1.0]');
  });
  assert.throws(function() {
    calc('[[1], ["foo"]]');
  });
});

test('unit', 'type inference', 'identifier', function() {
  assert.equal('int', calc2('let a = 1; a'));
  assert.equal('int', calc2('let a = 1; let b = a; b'));
  assert.throws(function() {
    calc2('let a = null; a');
  });
  assert.throws(function() {
    calc2('let b = a; let a = 1');
  });
});

test('unit', 'type inference', 'empty list', function() {
  assert.equal('list<int>', calc2('let a : list<int> = []; a'));
  assert.equal('int', calc2('let a : list<int> = []; a[1]'));

  assert.throws(function() {
    calc2('let a = []; a');
  });
});

test('unit', 'type inference', 'struct', function() {
  assert.equal('Widget', calc2('struct Widget {}; let a : Widget = null; a'));
  assert.equal('Widget', calc2('struct Widget {}; let a = new Widget; a'));
  assert.equal('Widget', calc2('struct Widget {}; new Widget'));
});

test('unit', 'type inference', 'lax numerics', function() {
  assert.equal('float', calc2('let a : float = 1; a'));
  assert.equal('int', calc2('let a = 1.0; let b : int = a; b'));
});

test('unit', 'type inference', 'function', function() {
  assert.equal('int', calc2('function foobar : int { return 1 }; let fb = foobar(); fb'));
  assert.throws(function() {
    calc2('function foobar {}; let fb2 = foobar(); fb2');
  });
});

test('unit', 'type inference', 'property access', function() {
  assert.equal('int', calc2('struct A { a = 1 }; let t = new A; t.a'));
  assert.equal('int', calc2('struct A { a = 1 }; new A.a'));
  assert.throws(function() {
    calc2('struct A { z = 1 }; let t = new A; t.a');
  });
});
