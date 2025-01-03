//
// Compiler executable tests
//

var path = require('path')
  , tmp = require('tmp')
  , virgil = require('../../lib')
  , compile = require('../../lib/support/cmd/compile')
  ;

var crazyNamespace = 'someKindOfBogusNamespaceThatNoOneWillUseSoWeCanSearchForIt';

test('functional', 'compiler', 'module', 'javascript', function(done) {
  tmp.dir({unsafeCleanup: true}, function(err, dir) {
    assert.ifError(err);

    compile.compile({
      args: [path.resolve(path.join(__dirname, '..', '..', 'language', 'examples', 'module', 'main.vgl'))],
      outputLanguage: 'javascript',
      module: true,
      outfile: dir,
      namespace: crazyNamespace,
      quiet: true
    }, function(err, files) {
      assert.ifError(err);
      assert.ok(files instanceof Array);
      assert.ok(files.length > 0);

      files.forEach(function(f) {
        Object.keys(f.dst).forEach(function(k) {
          // TODO - Fix this when we support auto browserification
          // assert.ok(f.dst[k].indexOf(crazyNamespace) >= 0);
        });
      });

      done();
    });
  });
});

test('functional', 'compiler', 'javascript', 'datetime', function(done) {
  virgil.compile('function main { let dt = new datetime }', 'javascript', {}, function(err, filemap) {
    assert.ifError(err);

    assert.isDefined(filemap['main.js']);
    assert.isDefined(filemap['virgil/datetime.js']);
    assert.ok(0 <= filemap['main.js'].indexOf("require('./virgil/datetime.js')"));

    done();
  });
});

test('functional', 'compiler', 'javascript', 'browserify', function(done) {
  tmp.dir({unsafeCleanup: true}, function(err, dir) {
    assert.ifError(err);

    compile.compile({
      args: [path.resolve(path.join(__dirname, '..', '..', 'language', 'examples', 'module', 'main.vgl'))],
      outputLanguage: 'javascript',
      module: true,
      outfile: dir,
      namespace: crazyNamespace,
      quiet: true,
      browserify: true
    }, function(err, files) {
      assert.ifError(err);
      assert.ok(files instanceof Array);
      assert.ok(files.length > 0);

      assert.equal(files.length, 1);

      done();
    });
  });
});

test('functional', 'compiler', 'module', 'C++', function(done) {
  tmp.dir({unsafeCleanup: true}, function(err, dir) {
    assert.ifError(err);

    compile.compile({
      args: [path.resolve(path.join(__dirname, '..', '..', 'language', 'examples', 'module', 'main.vgl'))],
      outputLanguage: 'cpp',
      module: true,
      outfile: dir,
      namespace: crazyNamespace,
      quiet: true
    }, function(err, files) {
      assert.ifError(err);
      assert.equal(typeof files, 'object');
      assert.ok(Object.keys(files).length > 0);

      files.forEach(function(f) {
        Object.keys(f.dst).forEach(function(k) {
          if (f.dst[k].split(/\r?\n/g).filter(function(line) {
            return !(line.length == 0 || line[0] == '#' || line.match(/^\s+$/));
          }).length > 0 && !f.dst[k].match(/namespace virgil/)) {
            if (f.dst[k].indexOf(crazyNamespace) < 0) {
              console.log(f.dst[k]);
            }
            assert.ok(f.dst[k].indexOf(crazyNamespace) >= 0);
          }
        });
      });

      done();
    });
  });
});
