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
if (!opts._.length) {
  delete opts._;
}
if (opts.help) {
  console.log('Usage:');
  console.log('  ./test.js [--help] [--no-coverage|--no-print-coverage] [--coverage-dir PATH] [files...]');
  console.log('');
  process.exit(0);
} else {
  console.log('Test options:', opts);
}
if (opts['coverage-dir']) {
  process.env.COVERAGE_DIR = opts['coverage-dir'];
}

// Set up coverage if asked for
if (opts.coverage !== false) {
  var coverageDirs = [
    path.resolve(path.join(__dirname, '..', 'lib')),
    path.resolve(path.join(__dirname, '..', 'bin')),
    path.resolve(path.join(__dirname, '..', 'runtime', 'javascript'))
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

// Test frameworkj
process.env.NODE_PATH += ':' + path.resolve(path.join(__dirname, '..', 'lib'));
global.assert = require('assert');
global.assert.isDefined = function(thing) {
  if (thing === undefined)
    throw new Error('Value is undefined');
};
global.assert.isUndefined = function(thing) {
  if (thing !== undefined)
    throw new Error('Expected value to be undefined');
};
global.assert.isNull = function(thing) {
  if (thing !== null)
    throw new Error('Expected value to be null');
};
global.assert.type = function(thing, type) {
  var t = typeof thing;
  if (t != type)
    throw new Error('Expected value to be type ' + type + ', was ' + t);
};
global.assert.match = function(thing, re) {
  if (!thing.match(re))
    throw new Error('Value doesn\'t match ' + re.toString());
};
var outstandingDones = {};
var todo = 0;
var tests = [];
var uncaught = 0;
var dots = 0;
process.on('uncaughtException', function(err) {
  tests.push([['uncaught exception', (++uncaught).toString()], err]);
});
global.test = function() {
  var cleanup = null;
  var args = Array.prototype.slice.call(arguments);
  var f = args.pop();
  var d = domain.create();
  var done = function(err) {
    delete outstandingDones[args.join(' / ')];
    var pip = (err ? clc.red : clc.green)('.');
    process.stdout.write(pip);
    if (++dots == 80) {
      dots = 0;
      process.stdout.write('\n');
    }
    tests.push([args, err]);
    if (cleanup) {
      try { cleanup() }
      catch (err) {
        console.error('Error when cleaning up from ' + args.join(' '));
        console.error(err.stack);
      }
    }

    todo--;
    if (todo == 0) {
      setImmediate(function() {
        if (todo == 0) {
          runIsolate();
        }
      });
    }
  };
  done.cleanup = function(f) {
    cleanup = f;
  };

  // Record failure
  d.on('error', function(err) {
    done(err);
  });

  try {
    if (!f) {
      throw new Error('Tests must specify a test function');
    }
    todo++;
    outstandingDones[args.join(' / ')] = true;
    d.run(function() {
      var hasCallback = !!f.toString().match(/^function\s*[\w\$\d]*\s*\(.+\)/);
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

// Isolated tests
var isolates = [];
var runIsolate = function() {
  if (isolates.length) {
    global.test.apply(this, isolates.shift());
  }
};
global.test.isolate = function() {
  isolates.push(Array.prototype.slice.call(arguments));
  // Make sure we trigger isolate tests if that's all we have
  setImmediate(function() {
    if (todo === 0) {
      runIsolate();
    }
  });
};

// Run the tests
var firstCwd = process.cwd();
console.log('Running tests...');
try {
  if (opts._) {
    opts._.forEach(function(f) {
      require(path.resolve(f));
    });
  } else {
    require('../test/levels');
    require('../test/functional');
    require('../test/integration');
    require('../test/unit');
  }
} catch (err) {
  tests.push([['uncaught exception', (++uncaught).toString()], err]);
}

// On first exit, collect results info.  If any tests fail we'll re-exit
// with a nonzero status code.
process.once('exit', function() {
  // Rebase our cwd
  if (firstCwd != process.cwd()) {
    console.warn('\n\nWarning: a test changed process.cwd() without restoring');
  }
  process.chdir(firstCwd);

  // Collate results
  var results = {tests: {}, children: {}};
  tests.forEach(function(t) {
    var names = t[0];
    var error = t[1];

    var cur = results;
    for (var i=0; i<names.length - 1; i++) {
      if (!cur.children[names[i]]) {
        cur.children[names[i]] = {
          children: {},
          tests: {}
        };
      }
      cur = cur.children[names[i]];
    }

    var name = names[names.length - 1];
    while (cur.tests[name])
      name += '.';
    cur.tests[name] = error;
  });

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
    console.log(clc.red('FAIL:'), clc.cyan(f[0].join(' / ')));
    if (f[1].loc) {
      try {
        require('../lib').support.errors.printErrorContext(f[1]);
       } catch (e) {}
     }
    console.log(f[1].stack);
  });
  console.log('');

  if (Object.keys(outstandingDones).length) {
    console.log(clc.red('Some tests never called done():'));
    console.log('');
    Object.keys(outstandingDones).forEach(function(k) {
      console.log('  ' + k);
    });
    console.log('');
  }

  // Write test output
  if (process.env.TEST_RESULTS_DIR) { // Normalize
    process.env.TEST_DIR = process.env.TEST_RESULTS_DIR;
  }
  if (process.env.TEST_DIR) {
    // TAP
    if (false) {
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

    // Junit
    if (true) {
      var junitOutput = {_name: 'testsuites', _content: []};
      var walk = function(src, dst) {
        Object.keys(src.tests).forEach(function(k) {
          dst._content.push({
            _name: 'testcase',
            _attrs: {
              name: k.replace(/\.vgl$/, '')
            },
            _content: [
              src.tests[k] ? {_name: 'failure', _content: src.tests[k].stack} : undefined
            ]
          });
        });
        Object.keys(src.children).forEach(function(k) {
          var newDst = { _name: 'testsuite', _attrs: {name: k.replace(/\.vgl$/, '')}, _content: [] };
          dst._content.push(newDst);
          walk(src.children[k], newDst);
        });
      };
      walk(results, junitOutput);
      fs.writeFileSync(path.join(process.env.TEST_DIR, 'results.xml'), jstoxml.toXML(junitOutput, {
        filter: {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            '\'': '&apos;',
            '&': '&amp;'
        }
      }));
    }
  }


  // Report coverage
  if (typeof __coverage__ != 'undefined') {

    var collector = new istanbul.Collector();
    collector.add(__coverage__);

    var reporter = new istanbul.Reporter(false, process.env.COVERAGE_DIR);
    if (opts['print-coverage'] !== false) {
      reporter.add('text');
    }
    if (process.env.COVERAGE_DIR) {
      reporter.add('lcov');
    }
    reporter.write(collector, true, function() {});
  }


  if (process.env.TEST_DIR) {
    console.log('Wrote test results to', path.join(process.env.TEST_DIR, 'results.xml'));
  }
  if (typeof __coverage__ != 'undefined' && process.env.COVERAGE_DIR) {
    console.log('Wrote coverage results to', process.env.COVERAGE_DIR + path.sep);
  }
  console.log('');

  if (failures.length) {
    process.exit(1);
  }
});
