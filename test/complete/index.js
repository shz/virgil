//
// Complete tests
//
// Compiles virgil code into native code, and runs that native code
// itself.  Tests pass if the executable returns a specific exit code.
// These tests are used as the full test from parsing up to regular execution.
//

var fs = require('fs')
  , path = require('path')
  , childProcess = require('child_process')
  , async = require('async')
  , virgil = require('../../lib')
  ;

var util = {
  read: function(filename) {
    return function(callback) {
      fs.readFile(filename, {encoding: 'utf8'}, function(err, data) {
        return callback(err, data);
      });
    };
  },
  compile: function(language) {
    return function(src, callback) {
      virgil.compile(src, language, {allowBare: true}, function(err, filemap, world) {
        if (err) {
          return callback(err);
        }
        var output = filemap[Object.keys(filemap)[0]];
        return callback(undefined, output);
      });
    };
  },
  pipe: function(executable, args) {
    return function(input, callback) {
      var output = [];
      var p = childProcess.spawn(executable, args);
      p.stdout.on('data', function(d) { output.push(d) });
      p.stderr.on('data', function(d) { output.push(d) });
      p.on('exit', function(code) {
        if (code === 0) {
          return callback();
        } else {
          return callback(new Error(Buffer.concat(output).toString()));
        }
      });
      p.stdin.write(input);
      p.stdin.end();
    }
  }
};

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
        util.read(filename),
        util.compile('javascript'),
        util.pipe(process.argv[0])
      ], function(err) {
        assert.ifError(err);
        done();
      })
    });
  });
});

// Swift
var swiftBase = path.join(__dirname, 'swift');
fs.readdir(swiftBase, function(err, files) {
  if (err) {
    throw err;
  }

  files.forEach(function(f) {
    var filename = path.join(swiftBase, f);
    test('complete', 'swift', f, function(done) {
      async.waterfall([
        util.read(filename),
        util.compile('swift'),
        util.pipe('xcrun', ['swift', '-'])
      ], function(err) {
        assert.ifError(err);
        done();
      })
    });
  });
});

// C++
// TODO
