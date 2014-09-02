var types = require('./util/require')('types')
  , parser = require('./util/require')('parser')
  , passes = require('./util/require')('passes')
  ;

var TR = types.TypeRef;
var resolve = types.generics.resolve;
var match = types.generics.matches;

exports.testBasic = function(test, assert) {
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

  test.finish();
};

exports.testMatching = function(test, assert) {
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

  test.finish();
};
