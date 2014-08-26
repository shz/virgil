var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , virgil = require('../../index')
  , errors = require('./errors')
  ;

var printError = function(options, src, err) {
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
};

var output = function(options, files, callback) {
  // Module, multiple files
  if (options.module) {
    // Ensure output directory exists
    mkdirp(options.outfile, function(err) {
      if (err) return callback(err);

      // Write each file
      async.each(files, function(f, callback) {
        var filename = f.filename.match(/([^\/]+)\.vgl$/)[1];
        filename = path.join(options.outfile, filename) + '.js';
        fs.writeFile(filename, f.dst + '\n', function(err) {
          if (err) {
            console.error('Unable to write output to ' + filename + ':', err.message);
            return callback(err);
          }

          return callback(undefined);
        });
      }, callback);
    });

  // No module, single output file
  } else if (options.outfile) {
    var result = files.map(function(f) { return f.dst }).join('\n\n');
    fs.writeFile(options.outfile, result, function(err) {
      if (err) {
        console.error('Unable to write output to ' + options.outfile + ':', err.message);
        return callback(err);
      }

      return callback(undefined);
    });

  // No module, stdout
  } else {
    console.log(files.map(function(f) { return f.dst }).join('\n\n'));
    callback(undefined);
  }
};

var compile = function(options, callback) {
  callback = callback || function() {};

  async.waterfall([
    // Read each file in
    async.map.bind(async, options.args, function(filename, callback) {
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
    }),

    // Once all files are read, attempt to compile them
    function(files, callback) {
      async.map(files, function(item, callback) {
        // Compile in snippet mode
        if (!options.module) {
          try {
            item.dst = virgil.compile(item.src, options.outputLanguage);
            return callback(undefined, item);
          } catch (err) {
            printError(options, item.src, err);
            return callback(err);
          }

        // Compile in module mode
        } else {
          var opts = {node: !!options.node};
          virgil.compileModule(item.filename, item.src, options.outputLanguage, opts, function(err, output) {
            if (err) {
              printError(options, item.src, err);
              return callback(err);
            } else {
              item.dst = output;
              return callback(undefined, item);
            }
          });
        }
      }, callback);
    },

    // Once we've successfully compiled all modules, concat and ouput
    // them, and then call it a day
    function(files, callback) {
      output(options, files, callback);
    }
  ], callback);
};

exports.run = function(options) {
  compile(options, function(err) {
    if (err && !options.watch)
      process.exit(1);

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
