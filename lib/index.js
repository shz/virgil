var fs = require('fs')
  , path = require('path')
  , async = require('async')
  , parser = require('./parser')
  , passes = require('./passes')
  , converters = require('./converters')
  , World = require('./world')
  ;

exports.parse = function(src) {
  var s = parser(src);
  for (var i=0; i<s.length; i++) {
    console.log(s[i].repr());
  }
};

exports.compile = function(src, language, options) {
  if (!converters.hasOwnProperty(language))
    throw new Error('Don\'t know how to compile down to ' + language);

  var program = parser.snippet(src);
  passes.runAll(program);
  return converters[language](program, options);
};

exports.compileModule = function(filename, src, language, options, callback) {
  if (!converters.hasOwnProperty(language))
    throw new Error('Don\'t know how to compile down to ' + language);

  var world = new World(filename);
  world.parseString(src, filename, function(err) {
    if (err) {
      err.world = world;
      return callback(err);
    }

    try {
      passes.runAll(world);

      // Normalize the path to find the filename of the root module, excluding all folders
      var moduleFilename = path.resolve(filename).split(path.sep);
      moduleFilename = moduleFilename[moduleFilename.length - 1];

      // Special case for browser javascript
      var browserJs = language == 'javascript' && !options.node;

      // Amalgamated output
      var output = browserJs ? '' : {};
      var merge = function(n) {

        for (var i in n) if (n.hasOwnProperty(i)) {
          if (browserJs) {
            output += '\n\n' + n[i];
          } else {
            if (output.hasOwnProperty(i))
              throw new Error('Output file ' + i + ' was defined in another module');
            output[i] = n[i];
          }
        }
      };

      // Process everything but the root module first
      for (var i in world.modules) if (world.modules.hasOwnProperty(i)) {
        if (i == moduleFilename)
          continue;

        merge(converters[language](world.modules[i], options));
      }

      // And then do the root module last
      merge(converters[language](world.modules[moduleFilename], options));

      // Put browser js into proper format
      if (browserJs) {
        output = {temp: output};
        output[moduleFilename.replace(/\.vgl$/, '.js')] = output.temp;
        delete output.temp;
      }

      var finish = function() {
        return callback(undefined, output, world);
      };

      // Add runtime for C++
      if (language == 'cpp') {
        var cppRuntimeBase = path.join(__dirname, '..', 'runtime', 'cpp');
        fs.readdir(cppRuntimeBase, function(err, files) {
          if (err) {
            err.world = world;
            return callback(err);
          }

          async.each(files, function(f, callback) {
            fs.readFile(path.join(cppRuntimeBase, f), {encoding: 'utf8'}, function(err, data) {
              if (err) return callback(err);

              output['runtime' + path.sep + f] = data;
              return callback();
            });

          }, function(err) {
            if (err) {
              err.world = world;
              return callback(err);
            } else {
              finish();
            }
          });
        });

      // Otherwise just be done
      } else {
        finish();
      }
    } catch (err) {
      err.world = world;
      return callback(err);
    }
  });
};

// Allow require-ing from node
require.extensions['.vgl'] = function(module, filename) {
  var fs = require('fs');
  var content = fs.readFileSync(filename, 'utf8');
  try {
    module._compile(exports.compileModule(content, 'javascript', {node: true}));
  } catch (err) {
    err.message = filename + ': ' + err.message;
    throw err;
  }
};
