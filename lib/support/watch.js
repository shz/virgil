//
// Watches all files in a world.  When a file changes, fires a callback.
//
// Note that after a change event is fired, all watching ends; you'll
// need to call this again with a new (or the old) World if you want
// to keep listening.
//

var fs = require('fs')
  , path = require('path')
  ;

var watch = module.exports = function(world, callback) {
  // Watches all files in world for changes, and fires the callback
  // *once* when one occurs.
  var called = false;
  var watching = [];

  var trigger = function(filename) {
    if (called) return;
    called = true;

    watching.forEach(function(w) { w.close() });
    callback(filename);
  };

  var watchFile = function(filename) {
    var fullpath = path.join(world.baseDir, path.relative(world.baseDir, filename));

    // Do some convoluted junk with modified time checking to get around
    // node's aggressive calling of the change event.
    fs.stat(fullpath, function(err, stats) {
      var modified = 0;
      if (stats)
        modified = +stats.mtime;

      var watcher = fs.watch(fullpath);
      watching.push(watcher);
      watcher.on('change', function() {
        fs.stat(fullpath, function(err, stats) {
          var nmod = 0;
          if (stats)
            nmod = +stats.mtime;

          // Bail if there wasn't actually a modification
          if (nmod == modified)
            return;

          trigger(filename);
        });
      });
    });
  };

  Object.keys(world.modules).concat(Object.keys(world.compiling)).forEach(function(k) {
    watchFile(k);
  });
};
