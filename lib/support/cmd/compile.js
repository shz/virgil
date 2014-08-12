var fs = require('fs')
  , async = require('async')
  , virgil = require('../../index')
  , errors = require('./errors')
  ;

var captureError = function(options, src, f) {
  try {
    f();
  } catch (err) {
    // If we have a start or end marker only, backfill the other
    // one dumbly so that the line highlights correctly.
    if (err.start && !err.end) {
      if (options.debug)
        console.error('Warning: No end marker for error');
      err.end = {
        line: err.start.line,
        col: 1000
      };
    } else if (err.end && !err.start) {
      if (options.debug)
        console.error('Warning: No start marker for error');
      err.start = {
        line: err.end.line,
        col: 0
      };
    }

    // Print out the error context if we have context info
    if (err.start && err.end) {
      errors.printContext(src, err);
      console.error('');
    }

    console.error(options.debug ? err.stack : err.message);
    return true;
  }
};

var output = function(options, result, callback) {
  if (options.outfile) {
    fs.writeFile(options.outfile, result, function(err) {
      if (err) {
        console.error('Unable to write output to', options.outfile, ':', err.message);
        return callback(err);
      }

      return callback(undefined);
    });
  } else {
    console.log(result);
    callback(undefined);
  }
};

var compile = function(options, callback) {
  callback = callback || function() {};

  // Read in all files first so that we can handle error messages
  // a bit better.
  async.map(options.args, function(filename, callback) {
    fs.readFile(filename, {encoding: 'utf8'}, function(err, body) {
      if (err) {
        err.filename = filename;
        return callback(err);
      }

      return callback(undefined, {
        src: body,
        dst: null,
        filename: filename
      });
    });
  }, function(err, files) {
    if (err) {
      console.error('Failed to read', err.filename, err.message);
      return callback(err);
    }

    // Next, compile away
    var hadError = !files.every(function(item) {
      var hadError = captureError(options, item.src, function() {
        var opts = {};
        f = virgil.compile;

        if (options.module) {
          opts.node = options.node;
          opts.moduleName = item.filename.replace(/\.vgl$/, '').replace(/[\/\\]/g, '.');
          f = virgil.compileModule;
        }
        item.dst = f(item.src, options.outputLanguage, opts);
      });

      if (hadError)
        return false;
      else
        return true;
    });

    if (hadError) {
      return callback(new Error());
    } else {
      // Now concat and call it a day
      var result = files.map(function(f) { return f.dst }).join('\n');
      output(options, result, callback);
    }
  });
};

exports.run = function(options) {
  compile(options, function() {
    var compiling = false;
    var changed = function() {
      if (compiling)
        return;
      compiling = true;
      compile(options, function() {
        compiling = false;
      });
    };

    if (options.watch) {
      for (var i=0; i<options.args.length; i++) {
        fs.watch(options.args[i], changed);
      }
    }
  });
};
