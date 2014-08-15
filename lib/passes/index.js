var async = require('async')
  , scope = require('../scope')
  , types = require('../types')
  , ast = require('../ast')
  , World = require('../world')
  ;

exports.runAll = function(thing, callback) {
  var finish = function() {
    // Build scope information and attach to the ast nodes
    scope.build(thing, true);

    // Calculate type information
    types.realize(thing);
  };

  if (thing instanceof Array) {
    finish();

  } else if (thing instanceof World) {
    var modules = Object.keys(thing.modules);
    async.each(Object.keys(thing.modules), function(m, callback) {
      thing.parse(m, function(err) {
        if (err) return callback(err);

        exports.runAll(
      });

    }, function(err) {
      if (err) return callback (err);

      try {
        finish();
      } catch (e) {
        return callback(e);
      }

      callback();
    });

  } else {
    throw new Error('Don\'t know how to run passes on ' + thing.constructor.name);
  }
};
