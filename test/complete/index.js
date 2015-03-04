//
// Complete tests
//
// Compiles virgil code into native code, and runs that native code
// itself.  Tests pass if the executable doesn't return a bad exit
// code.  These tests are used as the full test from parsing up to
// regular execution.
//

var fs = require('fs')
  , path = require('path')
  , childProcess = require('child_process')
  , async = require('async')
  , virgil = require('../../lib')
  ;

// Javascript
var jsBase = path.join(__dirname, 'javascript');
fs.readdir(jsBase, function(err, files) {
  if (err) {
    throw err;
  }

  files.forEach(function(f) {
    var filename = path.join(jsBase, f);

    test('complete', 'javascript', f, function(done) {

      async.waterfall([
        // Read
        function(callback) {
          fs.readFile(filename, {encoding: 'utf8'}, callback)
        },

        // Compile
        function(src, callback) {
          var js = '';
          try {
            js = virgil.compile(src, 'javascript', {});
          } catch (err) {
            callback(err);
          }

          callback(undefined, js);
          // virgil.compileModule(filename, src, 'javascript', {}, callback)
        },

        // Execute
        function(js, callback) {
          var output = [];
          var p = childProcess.spawn(process.argv[0]);
          p.stdout.on('data', function(d) { output.push(d) });
          p.stderr.on('data', function(d) { output.push(d) });
          p.on('exit', function(code) {
            if (code === 0) {
              return callback();
            } else {
              return callback(new Error(Buffer.concat(output).toString()));
            }
          });
          p.stdin.write(js);
          p.stdin.end();
        }
      ], function(err) {
        assert.ifError(err);
        done();
      })
    });
  });
});

// C++
// TODO
