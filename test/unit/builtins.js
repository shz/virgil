var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
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

exports.testListMembers = function(test, assert) {
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

  test.finish();
};

exports.testStrMembers = function(test, assert) {
  var c = checker(assert, 'str');
  c.method('upper', 'str');
  c.method('lower', 'str');
  c.method('at', 'int,str');
  c.method('asInt', 'int');
  c.method('asFloat', 'float');
  c.attr('length', 'int');
  c.done();

  assert.equal('int', calc2('"foo".length'));

  test.finish();
};

exports.testBoolMembers = function(test, assert) {
  var c = checker(assert, 'bool');
  c.done();

  test.finish();
};

exports.testFloatMembers = function(test, assert) {
  var c = checker(assert, 'float');
  c.method('format', 'int,str');
  c.method('floor', 'int');
  c.method('ceil', 'int');
  c.method('round', 'int');
  c.method('abs', 'float');
  c.method('cos', 'float');
  c.method('sin', 'float');
  c.done();

  test.finish();
};

exports.testIntMembers = function(test, assert) {
  var c = checker(assert, 'int');
  c.method('asFloat', 'float');
  c.method('asStr', 'str');
  c.done();

  test.finish();
};

exports.testCustomMethods = function(test, assert) {
  assert.equal('int',
    calc2('method foo (l : list<int>) : int { return l[2] }; [1, 2, 3].foo()'));

  test.finish();
};
