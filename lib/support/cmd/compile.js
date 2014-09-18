var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , clc = require('cli-color')
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

      // Each input file may result in multiple output files, we
      // we're going to create a new list.
      var outputFiles = [];
      files.forEach(function(f) {
        if (typeof f.dst == 'string')
          throw new Error('Internal error; expecting an object for compiled output in module mode');

        for (var i in f.dst) if (f.dst.hasOwnProperty(i)) {
          outputFiles.push({
            filename: i,
            dst: f.dst[i]
          });
        }
      });

      // Write each file
      async.each(outputFiles, function(f, callback) {
        // Put everything in the output dir
        var filename = path.join(options.outfile, f.filename);

        // Make sure the output file exists
        mkdirp(path.dirname(filename), function(err) {
          if (err) return callback(err);

          fs.writeFile(filename, f.dst + '\n', function(err) {
            if (err) {
              console.error('Unable to write output to ' + filename + ':', err.message);
              return callback(err);
            }

            console.log(clc.green('Successfully wrote'), filename);
            return callback(undefined);
          });
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

      console.log(clc.green('Successfully wrote'), options.outfile);
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
            err.filename = item.filename;
            printError(options, item.src, err);
            return callback(err);
          }

        // Compile in module mode
        } else {
          var opts = {node: !!options.node};
          virgil.compileModule(item.filename, item.src, options.outputLanguage, opts, function(err, output) {
            if (err) {
              printError(options, err.src || item.src, err);
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
    var changed = function(watcher, filename) {
      watcher.close();
      watch(filename);

      if (compiling)
        return;
      compiling = true;
      compile(options, function() {
        compiling = false;
      });
    };

    var watch = function(filename) {
      var watcher = fs.watch(filename);
      watcher.on('change', changed.bind(this, watcher, filename));
    }

    if (options.watch) {
      for (var i=0; i<options.args.length; i++) {
        watch(options.args[i]);
      }
    }
  });
};
