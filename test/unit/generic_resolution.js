var types = require('../../lib/types')
  , parser = require('../../lib/parser')
  , passes = require('../../lib/passes')
  ;

var TR = types.TypeRef;
var resolve = types.generics.resolve;
var match = types.generics.matches;

var calc2 = function(str) {
  var parsed = parser.snippet(str);
  passes.runAll(parsed);
  return types.calculate(parsed[parsed.length - 1]).toString();
};


test('unit', 'generic resolution', 'basic resolution', function() {
  var r = resolve( new TR("int")
                 , types.canned['int']
                 );
  assert.equal(Object.keys(r).length, 0);

  var r = resolve( new TR("'T")
                 , types.canned['int']
                 );
  assert.equal(Object.keys(r).length, 1);
  assert.isDefined(r["'T"]);
  assert.ok(types.equal(r["'T"], types.canned['int']));

  var r = resolve( new TR("'T")
                 , new TR('list', [types.canned['int']])
                 );
  assert.equal(Object.keys(r).length, 1);
  assert.isDefined(r["'T"]);
  assert.ok(types.equal(r["'T"], new TR('list', [types.canned['int']])));

  var r = resolve( new TR('list', [new TR("'T")])
                 , new TR('list', [new TR('int')])
                 );
  assert.equal(Object.keys(r).length, 1);
  assert.isDefined(r["'T"]);
  assert.ok(types.equal(r["'T"], types.canned['int']));

  // Straight up type mismatches are a problem
  assert.throws(function() {
    resolve(types.canned['int'], types.canned['str']);
  }, /equal/i);

  // As are generics with matching signatures but different types
  assert.throws(function() {
    resolve( new TR('list', [new TR("'T")])
           , new TR('func', [types.canned['str']])
           );
  }, /mismatch/i);

  // Generics of the same type with different number of params won't
  // work either.
  assert.throws(function() {
    resolve( new TR('list', [new TR("'T"), types.canned['str']])
           , new TR('list', [types.canned['str']])
           );
  }, /mismatch/i);
});

test('unit', 'generic resolution', 'advanced resolution', function() {
  var r = resolve( new TR("list", [new TR("'T")])
                 , types.canned['inferred']
                 );
  assert.equal(Object.keys(r).length, 0);

  var r = resolve( new TR("list", [new TR("'T")])
                 , types.canned['null']
                 );
  assert.equal(Object.keys(r).length, 0);

});

test('unit', 'generic resolution', 'matching', function() {
  assert.equal(match( new TR('str')
                    , types.canned['str']
                    ), true);

  assert.equal(match( new TR('str')
                    , types.canned['int']
                    ), false);

  assert.equal(match( new TR("'T")
                    , types.canned['str']
                    ), true);

  assert.equal(match( new TR('list', [new TR('str')])
                    , new TR('list', [new TR('str')])
                    ), true);

  assert.equal(match( new TR('list', [new TR("'T")])
                    , new TR('list', [new TR('str')])
                    ), true);
});

test('unit', 'generic resolution', 'return type', function() {
  assert.equal('int', calc2("function f(a : 'T) : 'T { return a }; f(1)"));
  assert.equal('int', calc2("method f(a : list<'T>) : 'T { return a[0] }; [1].f()"));
});
