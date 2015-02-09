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

  var world = new World(filename, options);
  world.parseString(src, path.relative(path.dirname(filename), filename), function(err) {
    if (err) {
      err.world = world;
      return callback(err);
    }

    try {
      passes.runAll(world);

      // Normalize the path to find the filename of the root module, excluding all folders
      var moduleFilename = path.resolve(filename).split(path.sep);
      moduleFilename = moduleFilename[moduleFilename.length - 1];
      var moduleName = moduleFilename.replace(/\.vgl$/, '');
      var namespace = options.namespace || path.dirname(path.resolve(filename))
                                               .split(path.sep);
      if (namespace instanceof Array)
        namespace = namespace[namespace.length - 1];

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

      // Normalize paths to exclude lib paths
      if (!browserJs) {
        var fileMap = {};
        var locs = world.libs.concat([world.base]);
        Object.keys(output).forEach(function(k) {
          var options = locs.map(function(l) {
            return path.relative(l, path.resolve(world.base, k));
          });

          // Use the option with the fewest path seps
          var smallest = 0;
          var smallestCount = Infinity;
          for (var i=0; i<options.length; i++) {
            var l = options[i].split(path.sep).length;
            if (l < smallestCount) {
              smallest = i;
              smallestCount = l;
            }
          }

          fileMap[k] = options[smallest];
        });

        // Map output
        var newOutput = {};
        for (var i in output) if (output.hasOwnProperty(i)) {
          newOutput[fileMap[i]] = output[i];
        }
        output = newOutput;
      }

      if (options.node) {

      } else if (language == 'javascript') {
        if (options.browserify) {
          output = 'var $m = {};\n\ntry {' + output + ' \n} catch (err) {}' +
                   '\n\nmodule.exports = $m[\'' + moduleName + '\'];\n';
        } else {
          // Wrap the module safely
          output = '(function() {\n var $m = {};' + output + '\n\n' +
                   'window.virgil = window.virgil || {};\n' +
                   'window.' + namespace + ' = $m[\'' + moduleName + '\'];\n' +
                   '})();\n';
        }

        output = {temp: output};
        output[moduleFilename.replace(/\.vgl$/, '.js')] = output.temp;
        delete output.temp;
      }

      if (language == 'cpp') {
        Object.keys(output).forEach(function(k) {
          var split = output[k].split(/\r?\n/);
          for (var i=0; i<split.length; i++) {
            if (split[i].length && split[i][0] != '#') {
              split.splice(i, 0, 'namespace ' + namespace + ' {\n');
              break;
            }
          }
          for (; i<split.length; i++) {
            if (split[i].length && split[i].match(/^#endif/)) {
              split[i] = '}\n\n' + split[i];
              break;
            }
          }

          output[k] = split.join('\n');
        });
      }

      // console.log(Object.keys(output));

      var finish = function() {
        // Prevent double callbacks
        try {
          callback(undefined, output, world);
        } catch (e) {}
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
if (require.extensions) {
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
}
