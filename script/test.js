#!/usr/bin/env node

// Run in the right context, especially useful for pulling in module
var path = require('path');
process.chdir(path.join(__dirname, '..'));

// Bring on modules now that we're correctly based
var domain = require('domain')
  , fs = require('fs')
  , clc = require('cli-color')
  , minimist = require('minimist')
  , jstoxml = require('jstoxml')
  ;

// Parse options
var opts = minimist(process.argv.slice(2));
delete opts._;
console.log('Test options:', opts);

// Set up coverage if asked for
if (opts.coverage !== false) {
  var coverageDirs = [
    path.resolve(path.join(__dirname, '..', 'lib')),
    path.resolve(path.join(__dirname, '..', 'bin'))
  ];
  var istanbul = require('istanbul');
  var ins = new istanbul.Instrumenter();
  istanbul.hook.hookRequire(function(filename) {
    if (!filename.match(/\.js$/) && !filename.match(/^[^\.]+$/)) {
      return false;
    }
    for (var i=0; i<coverageDirs.length; i++) {
      if (filename.indexOf(coverageDirs[i]) == 0) {
        return true;
      }
    }
    return false;
  }, function(code, filename) {
    return ins.instrumentSync(code, filename);
  });
}

// Test framework
process.env.NODE_PATH += ':' + path.resolve(path.join(__dirname, '..', 'lib'));
var tests = [];
global.assert = require('assert');
global.test = function() {
  var args = Array.prototype.slice.call(arguments);
  var f = args.pop();
  var d = domain.create();
  var done = function(err) {
    var pip = (err ? clc.red : clc.green)('.');
    process.stdout.write(pip);
    tests.push([args, err]);
  };

  // Record failure
  d.on('error', function(err) {
    done(err);
  });

  try {
    if (!f) {
      throw new Error('Tests must specify a test function');
    }
    d.run(function() {
      var hasCallback = !!f.toString().match(/^function\s*[\w\$]*\(.+\)/);
      if (hasCallback) {
        f(done);
      } else {
        f();
        done();
      }
    });
  } catch (err) {
    d.emit('error', err);
  }
};

// Run the tests
console.log('Running tests...');
require('../test/levels');

// On first exit, collect results info.  If any tests fail we'll re-exit
// with a nonzero status code.
process.once('exit', function() {
  // Report test results
  var failures = tests.filter(function(t) {
    return !!t[1];
  });
  console.log('\n');
  console.log('Test results:');
  console.log(
    tests.length + ' tests, ' +
    (failures.length ? clc.red : clc.greenBright)(failures.length + ' failures')
  );
  failures.forEach(function(f) {
    console.log('');
    console.log(clc.red('FAIL:'), clc.blue(f[0].join(' - ')));
    console.log(f[1].stack);
  });
  console.log('');

  // Write tap output
  if (process.env.TEST_RESULTS_DIR) { // Normalize
    process.env.TEST_DIR = process.env.TEST_RESULTS_DIR;
  }
  if (process.env.TEST_DIR) {
    var tapOutput = '1..' + tests.length;
    for (var i=0; i<tests.length; i++) {
      var ok = !tests[i][1];
      tapOutput += '\n';
      tapOutput += ok ? 'ok' : 'not ok';
      tapOutput += ' ' + (i + 1) + ' ';
      tapOutput += tests[i][0].join('/');
      if (!ok) {
        tapOutput += [''].concat((tests[i][1].stack || tests[i][1].message)
            .split(/\r?\n/)).join('\n    ');
      }
    }
    tapOutput += '\n';
    fs.writeFileSync(path.join(process.env.TEST_DIR, 'results.tap'), tapOutput);
  }


  // Report coverage
  if (typeof __coverage__ != 'undefined') {

    var collector = new istanbul.Collector();
    collector.add(__coverage__);

    var reporter = new istanbul.Reporter(false, process.env.COVERAGE_DIR);
    reporter.add('text');
    if (process.env.COVERAGE_DIR) {
      reporter.add('lcov');
    }
    reporter.write(collector, true, function() {});
  }


  if (process.env.TEST_DIR) {
    console.log('Wrote test results to', path.join(process.env.TEST_DIR, 'results.tap'));
  }
  if (typeof __coverage__ != 'undefined' && process.env.COVERAGE_DIR) {
    console.log('Wrote coverage results to', process.env.COVERAGE_DIR + path.sep);
  }
  console.log('');

  if (failures.length) {
    process.exit(1);
  }
});
