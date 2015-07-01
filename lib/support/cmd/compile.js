var fs = require('fs'); // Must be on own line to work with brfs
var path = require('path')
  , async = require('async')
  , mkdirp = require('mkdirp')
  , clc = require('cli-color')
  , virgil = require('../../index')
  , errors = require('../errors')
  , watch = require('../watch')
  ;

var printError = function(options, src, err) {
  // If we have a start or end marker only, backfill the other
  // one dumbly so that the line highlights correctly.
  if (err.loc && err.loc.start && !err.loc.end) {
    if (options.debug)
      console.error('Warning: No end marker for error');
    err.loc.end = {
      line: err.loc.start.line,
      col: 1000
    };
  } else if (err.loc && err.loc.end && !err.loc.start) {
    if (options.debug)
      console.error('Warning: No start marker for error');
    err.loc.start = {
      line: err.loc.end.line,
      col: 0
    };
  }

  // Set the error's source if it isn't set slready.  This may
  // not be necessary right now, and in either case we should strive
  // to make it unnecessary.
  if (!err.src) {
    err.src = src;
  }

  // Print out the error context if we have context info
  if (err.loc) {
    errors.printErrorContext(err);
    console.error('');
  }

  if (!(err instanceof Error)) {
    console.error('The compiler is throwing bogus errors, zounds!');
    if (options.debug) {
      console.trace();
    }
  } else {
    console.error(options.debug ? err.stack : err.message);
  }
};

var output = function(options, files, callback) {

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
            if (!options.quiet) {
              console.error('Unable to write output to ' + filename + ':', err.message);
            }
            return callback(err);
          }

          if (!options.quiet) {
            console.log(clc.green('Successfully wrote'), filename);
          }
          return callback(undefined);
        });
      });
    }, function(err) {
      if (err) return callback(err);
      return callback(undefined, files);
    });
  });
};

var compile = exports.compile = function(options, callback) {
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
        var opts = {
          libs: options.libs,
          prune: options.prune,
          filename: item.filename,
          convert: {
            namespace: options.namespace,
            browserify: options.browserify
          }
        };
        virgil.compile(item.src, options.outputLanguage, opts, function(err, output, world) {
          if (err) {
            if (!options.quiet) {
              printError(options, err.src || item.src, err);
            }
            return callback(err);
          } else {
            item.dst = output;
            item.world = world;
            return callback(undefined, item);
          }
        });
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
  var go = function(filename) {
    if (filename) {
      console.log(clc.cyan('Detected change'), path.relative(process.cwd(), filename));
    }

    compile(options, function(err, results) {
      if (err) {
        if (!options.watch)
          process.exit(1);
        else if (err.world)
          watch(err.world, go);
      } else {
        if (options.watch) {
          results.forEach(function(r) {
            if (r.world)
              watch(r.world, go);
          });
        }
      }
    });
  };
  go();
};
