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

var checker = function(assert, t) {
  var counts = {
    attr: 0,
    method: 0
  };
  var o = {
    method: function(name, type) {
      var m = types.builtin[t].findMethod(name);
      assert.isDefined(m);
      assert.equal(m.generics.slice(1).join(','), type);

      counts.method++;
      return o;
    },
    attr: function(name, type) {
      var a = types.builtin[t].attributes[name];

      assert.isDefined(a);
      assert.equal(a.toString(), type);

      counts.attr++;
      return o;
    },
    done: function() {
      assert.equal(Object.keys(types.builtin[t].attributes).length, counts.attr, 'Attribute count is incorrect');
      assert.equal(types.builtin[t].methods.length, counts.method, 'Method count is incorrect');
    }
  };
  return o;
};

test('unit', 'builtins', 'list members', function() {
  var c = checker(assert, 'list');
  c.method('empty', 'void');
  c.method('remove', 'int,void');
  c.method('removeRange', 'int,int,list<\'T>');
  c.method('push', '\'T,void');
  c.method('pop', '\'T');
  c.attr('length', 'int');
  c.done();

  assert.equal('int', calc2('[1, 2, 3].length'));
  assert.equal('void', calc2('[1, 2, 3].empty()'));
  assert.throws(function() {
    assert.ok(types.equal(types.make('int'), calc2('[1, 2, 3].foobam')));
  });
  assert.throws(function() {
    assert.ok(types.equal(types.make('int'), calc2('[1, 2, 3].foobam()')));
  });
});

test('unit', 'builtins', 'datetime members', function() {
  var c = checker(assert, 'datetime');
  c.attr('offset', 'int');
  c.attr('ts', 'int');
  c.method('toLocal', 'datetime');
  c.method('toGMT', 'datetime');
  c.method('toOffset', 'int,datetime');
  c.method('format', 'str,str,str');
  c.done();
});

test('unit', 'builtins', 'str members', function() {
  var c = checker(assert, 'str');
  c.method('trimStart', 'str');
  c.method('trimEnd', 'str');
  c.method('trim', 'str');
  c.method('upper', 'str');
  c.method('lower', 'str');
  c.method('at', 'int,str');
  c.method('asInt', 'int');
  c.method('asFloat', 'float');
  c.method('substr', 'int,int,str');
  c.attr('length', 'int');
  c.done();

  assert.equal('int', calc2('"foo".length'));
});

test('unit', 'builtins', 'bool members', function() {
  var c = checker(assert, 'bool');
  c.done();
});

test('unit', 'builtins', 'float members', function() {
  var c = checker(assert, 'float');
  c.method('format', 'int,str');
  c.method('floor', 'int');
  c.method('ceil', 'int');
  c.method('round', 'int');
  c.method('abs', 'float');
  c.method('cos', 'float');
  c.method('sin', 'float');
  c.method('tan', 'float');
  c.method('acos', 'float');
  c.method('asin', 'float');
  c.method('atan', 'float');
  c.method('sqrt', 'float');
  c.done();
});

test('unit', 'builtins', 'int members', function() {
  var c = checker(assert, 'int');
  c.method('asFloat', 'float');
  c.method('asStr', 'str');
  c.method('abs', 'int');
  c.done();
});

test('unit', 'builtins', 'custom methods', function() {
  assert.equal('int',
    calc2('method foo (l : list<int>) : int { return l[2] }; [1, 2, 3].foo()'));
});
