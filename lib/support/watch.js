//
// Watches all files in a world.  When a file changes, fires a callback.
//
// Note that after a change event is fired, all watching ends; you'll
// need to call this again with a new (or the old) World if you want
// to keep listening.
//

var fs = require('fs'); // Must be on own line to work with brfs
var path = require('path');

//
// Watches all files in the world for changes, and fires the callback
// *once* when a change occurs.
//
var watch = module.exports = function(world, callback) {
  var called = false;
  var watching = [];

  // Trigger the callback, cleaning up after itself and ensuring
  // that the call happens only once.
  var trigger = function(filename) {
    if (called) {
      return;
    }
    called = true;

    watching.forEach(function(w) { w.close() });
    callback(filename);
  };

  var watchFile = function(moduleName) {
    var filename = world.modules[moduleName];
    if (filename) {
      filename = filename.filename;
    } else {
      filename = moduleName;
    }

    // Do some convoluted junk with mtime checking to get around
    // node's overly aggressive firing of the change event.
    fs.stat(filename, function(err, stats) {
      if (err) {
        return;
      }

      var modified = +stats.mtime;
      var watcher = fs.watch(filename);
      watching.push(watcher);
      watcher.on('change', function() {
        fs.stat(filename, function(err, stats) {
          var nmod = NaN;
          if (stats) {
            nmod = +stats.mtime;
          }

          // If no real modification ocurred, escape
          if (nmod == modified) {
            return;
          }

          trigger(filename);
        });
      });
    });
  };

  Object.keys(world.modules)
    .concat(Object.keys(world.compiling))
    .forEach(watchFile);
};
