var tokenizer = require('../../../lib/tokenizer/index')
  , Token = require('../../../lib/tokenizer/token')
  ;

test('unit', 'tokenizer', 'tokenize', 'basic', function() {
  var str = 'let a = 1';
  var tokens = tokenizer(str);

  assert.ok(tokens instanceof Array);
  assert.ok(tokens.length > 0);
  tokens.forEach(function(t) {
    assert.ok(t instanceof Token);
  });
});

test('unit', 'tokenizer', 'tokenize', 'newlines', function() {
  var str = 'let a = 1\nlet b = 2';
  var tokens = tokenizer(str);

  var foundNewline = false;
  assert.ok(tokens instanceof Array);
  assert.ok(tokens.length > 0);
  tokens.forEach(function(t) {
    assert.ok(t instanceof Token);
    if (t.name == 'newline') {
      foundNewline = true;
    }
  });
  assert.ok(foundNewline);
});

test('unit', 'tokenizer', 'tokenize', 'continuation', function() {
  var str = 'let a = 1 \\\n + 1';
  var tokens = tokenizer(str);

  assert.ok(tokens instanceof Array);
  assert.ok(tokens.length > 0);
  tokens.forEach(function(t) {
    assert.ok(t instanceof Token);
  });
});

test('unit', 'tokenizer', 'tokenize', 'comments', function() {
  var str = 'let a = 1 # hello \n + 1';
  var tokens = tokenizer(str);

  assert.ok(tokens instanceof Array);
  assert.ok(tokens.length > 0);
  tokens.forEach(function(t) {
    assert.ok(t instanceof Token);
  });
});

test('unit', 'tokenizer', 'tokenize', 'semicolons', function() {
  var str = 'let a = 1; let b = 1';
  var tokens = tokenizer(str);

  assert.ok(tokens instanceof Array);
  assert.ok(tokens.length > 0);
  tokens.forEach(function(t) {
    assert.ok(t instanceof Token);
  });

  str = 'let a = 1;\nlet b = 1';
  assert.throws(function() {
    tokens = tokenizer(str);
  }, function(err) {
    try {
      assert.match(err.message, /semicolon/i);
      assert.isDefined(err.loc);
      assert.isDefined(err.loc.start);
      assert.isDefined(err.loc.start.line);
      assert.isDefined(err.loc.start.col);
      assert.isDefined(err.loc.end);
      assert.isDefined(err.loc.end.line);
      assert.isDefined(err.loc.end.col);
      return true;
    } catch (e) {
      return false;
    }
  });
});

test('unit', 'tokenizer', 'tokenize', 'errors', function() {
  var str = 'let a = $%^#$%^';

  assert.throws(function() {
    var tokens = tokenizer(str);
  }, function(err) {
    try {
      assert.match(err.message, /unknown/i);
      assert.isDefined(err.loc);
      assert.isDefined(err.loc.start);
      assert.isDefined(err.loc.start.line);
      assert.isDefined(err.loc.start.col);
      assert.isDefined(err.loc.end);
      assert.isDefined(err.loc.end.line);
      assert.isDefined(err.loc.end.col);
      return true;
    } catch (e) {
      return false;
    }
  });
});

