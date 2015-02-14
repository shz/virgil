//
// Levels tests
//
// Phases runs of the compiler across the language examples, ensuring
// that everything is as we expect.  Practically, this means we walk
// our way up from tokenizing to code generation.
//

var fs = require('fs')
  , path = require('path')
  , async = require('async')
  ;

var levels = { read: require('./read')
             , tokenize: require('./tokenize')
             // , parse: require('./parse')
             // , scope: require('./scope')
             // , types: require('./types')
             };
var base = path.join(__dirname, '..', '..', 'language', 'examples');

fs.readdir(base, function(err, files) {
  if (err) {
    throw err;
  }

  files.forEach(function(f) {
    var cur = path.join(base, f);
    async.eachSeries(Object.keys(levels), function(k, callback) {
      test('level', f, k, function(done) {
        levels[k](cur, function(result) {
          cur = result;
          done();
          callback();
        });
      });
    });
  });
});
