var Token = require('../../../lib/tokenizer/token');

test('unit', 'tokenizer', 'token', 'basic', function() {
  assert.isDefined(Token);
  assert.type(Token, 'function');
});

test('unit', 'tokenizer', 'token', 'creation', function() {
  var t;

  // Typical use
  t = new Token('foo', 'bar', {
    start: {
      line: 0,
      col: 1
    },
    end: {
      line: 1,
      col: 2
    }
  });

  assert.equal(t.name, 'foo');
  assert.equal(t.value, 'bar');
  assert.deepEqual(t.loc, {
    start: {
      line: 0,
      col: 1
    },
    end: {
      line: 1,
      col: 2
    }
  });

  // Defaults
  t = new Token('blah');
  assert.equal(t.name, 'blah');
  assert.equal(t.value, null);
  assert.isDefined(t.loc);
  assert.isDefined(t.loc.start);
  assert.isDefined(t.loc.start.line);
  assert.isDefined(t.loc.start.col);
  assert.isDefined(t.loc.end);
  assert.isDefined(t.loc.end.line);
  assert.isDefined(t.loc.end.col);
});

test('unit', 'tokenizer', 'token', 'toString()', function() {
  var s;
  s = new Token('foo', 'bar').toString();
  assert.match(s, /foo/);
  assert.match(s, /bar/);

  s = new Token('blah').toString();
  assert.match(s, /blah/);
});

test('unit', 'tokenizer', 'token', 'inspect()', function() {
  var s;
  s = new Token('foo', 'bar').inspect();
  assert.match(s, /foo/);
  assert.match(s, /bar/);

  s = new Token('blah').inspect();
  assert.match(s, /blah/);
});
