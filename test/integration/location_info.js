var parser = require('../../lib/parser')
  ;

var parse = function(s) {
  return parser.snippet(s);
};

test('integration', 'location info', 'basic nud', function() {
  var node = parse('12345');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 1, col: 5 }
  });
});

test('integration', 'location info', 'negation', function() {
  var node = parse('-1');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 1, col: 2 }
  });
  assert.deepEqual(node[0].expression.loc, {
    start: { line: 1, col: 1 },
    end: { line: 1, col: 2 }
  });
});

test('integration', 'location info', 'grouping', function() {
  var node = parse('(\n2 - 2)');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 2, col: 6 }
  });
});

test('integration', 'location info', 'multiline', function() {
  var node = parse('let a =\n1');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 2, col: 1 }
  });
  assert.deepEqual(node[0].expression.loc, {
    start: { line: 2, col: 0 },
    end: { line: 2, col: 1 }
  });
});

test('integration', 'location info', 'led', function() {
  var node = parse('1 +\n 1');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 2, col: 2 }
  });
  assert.deepEqual(node[0].left.loc, {
    start: { line: 1, col: 0 },
    end: { line: 1, col: 1 }
  });
  assert.deepEqual(node[0].right.loc, {
    start: { line: 2, col: 1},
    end: { line: 2, col: 2 }
  });
});

test('integration', 'location info', 'block', function() {
  var node = parse('method foo(i: int) {\n  let a = 1\n  return a + 3\n}');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 4, col: 1 }
  });
  assert.deepEqual(node[0].body.loc, {
    start: { line: 1, col: 19 },
    end: { line: 4, col: 1 }
  });
});

test('integration', 'location info', 'assignment block', function() {
  var node = parse('let thing = new\nKablam\n{ a = 1\n b = 2\n}');

  assert.deepEqual(node[0].loc, {
    start: { line: 1, col: 0 },
    end: { line: 5, col: 1 }
  });
  assert.deepEqual(node[0].expression.loc, {
    start: { line: 1, col: 12 },
    end: { line: 5, col: 1 }
  });
  assert.deepEqual(node[0].expression.args.declarations[0].loc, {
    start: { line: 3, col: 2 },
    end: { line: 3, col: 7 }
  });
  assert.deepEqual(node[0].expression.args.declarations[1].loc, {
    start: { line: 4, col: 1 },
    end: { line: 4, col: 6 }
  });
});

test('integration', 'location info', 'empty assignment block', function() {
  var node = parse('let thing = new\nKablam\n{ a = 1\n b = 2\n}');

  // TODO
});

test('integration', 'location info', 'extern statement', function() {
  var node = parse('let thing = new\nKablam\n{ a = 1\n b = 2\n}');

  // TODO
});

