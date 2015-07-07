var errors = require('../../../lib/support/errors');

test('unit', 'support', 'errors', 'highlighters', 'console', function() {
  var check = function(shouldDiffer, tokenName, tokenValue, hasError) {
    if (!tokenValue) {
      tokenValue = 'default';
    }

    var result = errors.highlighters.console({
      name: tokenName,
      value: tokenValue
    }, hasError);

    if (shouldDiffer) {
      assert.notEqual(result, tokenValue);
    } else {
      assert.equal(result, tokenValue);
    }
  };

  check(true, 'true');
  check(true, 'false');
  check(true, 'if');
  check(true, 'import');
  check(true, 'comment');
  check(false, 'identifier', 'foo');
  check(true, 'identifier', 'Foo');
  check(true, 'string');
  check(true, 'gref', '\'T');
  check(true, 'identifier', 'foo', true);
  check(true, '=');
});

test('unit', 'support', 'errors', 'highlighters', 'html', function() {
  var check = function(shouldDiffer, tokenName, tokenValue, hasError) {
    if (!tokenValue) {
      tokenValue = 'default';
    }

    var result = errors.highlighters.html({
      name: tokenName,
      value: tokenValue
    }, hasError);

    if (shouldDiffer) {
      assert.notEqual(result, tokenValue);
      assert.match(result, /<span class="token \w+">/);
    } else {
      assert.notEqual(result, tokenValue);
      assert.ok(result.indexOf(tokenValue) >= 0);
      assert.match(result, /<span class="token normal">/);
    }
  };

  check(true, 'true');
  check(true, 'false');
  check(true, 'if');
  check(true, 'import');
  check(true, 'comment');
  check(false, 'identifier', 'foo');
  check(true, 'identifier', 'Foo');
  check(true, 'string');
  check(true, 'gref', '\'T');
  check(true, 'identifier', 'foo', true);
  check(true, '=');
});


test('unit', 'support', 'error', 'getContext', function() {
  var ctx;
  var source = [ 'a'
               , 'b'
               , 'c'
               , 'd'
               , 'e'
               , 'f'
               , 'g'
               , 'h'
               , 'i'
               , 'j'
               , 'k'
               , 'l'
               , 'm'
               , 'n'
               , 'o'
               , 'p'
               ].join('\n');

  ctx = errors.getContext(source, 5, 2);
  assert.equal(ctx.err, undefined);
  assert.equal(ctx.filename, undefined);
  assert.equal(ctx.lines.length, 5);
  assert.equal(ctx.toString(), 'c\nd\ne\nf\ng');
  assert.deepEqual(ctx.gutter(), ['3', '4', '5', '6', '7']);
  ctx.lines.forEach(function(l, i) {
    assert.equal(l.hasError, false, 'line ' + i + ' hasError');
    assert.equal(l.number, i + 3, 'line "' + l.content + '" has correct number (' + l.number + ')');

  });

  ctx = errors.getContext(source, 'foo.vgl', 3, 5);
  assert.equal(ctx.err, undefined);
  assert.equal(ctx.filename, 'foo.vgl');
  assert.equal(ctx.lines.length, 8);
  assert.equal(ctx.toString(), 'a\nb\nc\nd\ne\nf\ng\nh');
  assert.deepEqual(ctx.gutter(), ['1', '2', '3', '4', '5', '6', '7', '8']);
  ctx.lines.forEach(function(l, i) {
    assert.equal(l.hasError, false, 'line ' + i + ' hasError');
    assert.equal(l.number, i + 1, 'line ' + i + ' has correct number');
  });

  ctx = errors.getContext(source, {
    start: 4,
    end: 6
  });
  assert.equal(ctx.err, undefined);
  assert.equal(ctx.filename, undefined);
  assert.equal(ctx.lines.length, 9);
  assert.equal(ctx.toString(), 'a\nb\nc\nd\ne\nf\ng\nh\ni');
  assert.deepEqual(ctx.gutter(), ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
  ctx.lines.forEach(function(l, i) {
    assert.equal(l.hasError, false, 'line ' + i + ' hasError');
    assert.equal(l.number, i + 1, 'line ' + i + ' has correct number');
  });
});

test('unit', 'support', 'errors', 'getErrorContext()', function() {
  var err = {
    message: 'Booga',
    src: 'a\nb\nc\nd\nf\ng\n',
    filename: 'booga.vgl',
    loc: {
      start: {
        line: 1,
        col: 0
      },
      end: {
        line: 1,
        col: 1
      }
    }
  };

  var ctx = errors.getErrorContext(err, 2);

  assert.equal(ctx.err, err);
  assert.equal(ctx.filename, 'booga.vgl');
  assert.equal(ctx.lines.length, 4);
  assert.equal(ctx.lines[0].hasError, true);
  assert.equal(ctx.lines[1].hasError, false);
  assert.equal(ctx.lines[2].hasError, false);
  assert.equal(ctx.lines[3].hasError, false);
  assert.equal(ctx.toString(), 'a\nb\nc\nd');
  assert.deepEqual(ctx.gutter(' '), ['1', '2', '3', '4']);
});

test('unit', 'support', 'errors', 'printErrorContext()', function(done) {
  var output = [];
  var oldError = console.error;
  console.error = function() {
    output.push(Array.prototype.join.call(arguments, ' '));
  };
  done.cleanup(function() {
    console.error = oldError;
  });

  var err = {
    message: 'Bad news',
    filename: 'it.vgl',
    src: [ 'function main {'
         , '  let a = 1'
         , '  let b = 20'
         , ''
         , '  let c = a * b'
         , '}'
         , ''
         ].join('\n'),
    loc: {
      start: { line: 2, col: 2 },
      end: { line: 2, col: 12 }
    }
  };

  errors.printErrorContext(err);
  assert.ok(output.length > 1);
  assert.ok(output[0].match(/it\.vgl/));
  assert.ok(output[output.length - 1].match(/Bad news/));

  output = [];
  errors.printErrorContext(err, false);
  assert.ok(output.length > 1);
  assert.ok(!output[0].match(/it\.vgl/));
  assert.ok(output[output.length - 1].match(/Bad news/));

  output = [];
  errors.printErrorContext(err, false, false);
  assert.ok(output.length > 1);
  assert.ok(!output[0].match(/it\.vgl/));
  assert.ok(!output[output.length - 1].match(/Bad news/));

  output = [];
  delete err.filename;
  errors.printErrorContext(err);
  assert.ok(output.length > 1);
  assert.ok(!output[0].match(/it\.vgl/));

  done();
});

test('unit', 'support', 'errors', 'Context', function() {
  var c;

  var err = { message: 'rats', filename: 'a.vgl' };
  c = new errors.Context(err);
  c.addLine(9, 'hello');
  c.addLine(10, 'world');
  assert.equal(c.err, err);
  assert.equal(c.filename, 'a.vgl');
  assert.deepEqual(c.gutter('0'), ['09', '10']);
  assert.equal(c.toString(), 'hello\nworld');
  assert.deepEqual(c.highlight(function() { return 'h' }), ['h', 'h']);

  c = new errors.Context('a.vgl');
  c.addLine(1, '^%$^&');
  assert.deepEqual(c.highlight(), ['^%$^&']);
});
