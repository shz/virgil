#!/usr/bin/env node

// Run in the right context, especially useful for pulling in module
var path = require('path');
process.chdir(path.join(__dirname, '..'));

// Bring on modules now that we're correctly based
var domain = require('domain')
  , clc = require('cli-color')
  ;

// Set up coverage if asked for
if (true) {
  var istanbul = require('istanbul');
  var ins = new istanbul.Instrumenter();
  istanbul.hook.hookRequire(function(filename) {
    return filename.match(/\.js$/) && filename.indexOf(path.resolve(path.join(__dirname, '..')));
  }, ins.instrumentSync.bind(ins));
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

process.on('exit', function() {
  // Collect coverage
  if (typeof __coverage__ != 'undefined') {
    // TODO
    // console.log(__coverage__);
  }

  // Collect test results
  var failures = tests.filter(function(t) {
    return !!t[1];
  });
  console.log('');
  console.log('Test results:');
  console.log(tests.length + ' tests, ' + failures.length + ' failures');
  failures.forEach(function(f) {
    console.log('');
    console.log(clc.red('FAIL:'), clc.blue(f[0].join(' - ')));
    console.log(f[1].stack);
  });
});
