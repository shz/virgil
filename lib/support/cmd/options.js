var fs = require('fs');

exports.parse = function() {
  // Defaults
  var options = {
    debug: false,
    browserify: false,
    outfile: null,
    watch: false,
    printVersion: false,
    namespace: null,
    prune: false,
    libs: [],
    args: [],
    quiet: false
  };

  var printUsage = function() {
    var exec = process.argv[1].split(/[\/\\]/);
    exec = exec[exec.length - 1];
    console.log('Usage:', exec, '[-L LIBFOLDER] [-o|--output OUTFILE] [-w|--watch] [-p|--prune ENTRYPOINT] [-d|--debug] [-n|--namespace NAMESPACE] FILE');
    console.log('');
  };

  var next = null;

  for (var i=2; i<process.argv.length; i++) {
    var arg = process.argv[i];

    if (next && arg[0] == '-') {
      console.error('Bad arguments');
      arg = '-h';
    } else if (next) {
      next(arg);
      next = null;
      continue;
    }

    switch (arg) {
      case '-d':
      case '--debug':
        options.debug = true;
        break;

      case '-v':
      case '--version':
        options.printVersion = true;
        break;

      case '-w':
      case '--watch':
        options.watch = true;
        break;

      case '-o':
      case '--output':
        next = function(arg) {
          options.outfile = arg;
        };
        break;

      case '-L':
        next = function(arg) {
          options.libs.push(arg);
        };
        break;

      case '-p':
      case '--prune':
        next = function(arg) {
          var prune = options.prune = options.prune || {};
          prune.entryPoints = prune.entryPoints || [];
          prune.entryPoints.push(arg);
        };
        break;

      case '-q':
      case '--quiet':
        options.quiet = true;
        break;

      case '-n':
      case '--namespace':
        next = function(arg) {
          options.namespace = arg;
        };
        break;

      case '--browserify':
        options.browserify = true;
        break;

      default:
        if (arg[0] == '-') {
          console.log('Unknown option', arg);
        } else {
          options.args.push(arg);
          break;
        }
      case '-h':
      case '--help':
        printUsage();
        process.exit(1);
        break;
    }
  }

  // If we're just printing version info, ignore the sanity check

  if (options.printVersion)
    return options;

  // Sanity check

  if (options.namespace && !options.namespace.match(/^[a-z][a-zA-Z0-9]*$/)) {
    console.error('Bad namespace', options.namespace + ', must be alphanumeric lowerCamelCase');
    printUsage();
    process.exit(1);
  }

  if (!options.args.length) {
    console.error('No input file(s) specified');
    printUsage();
    process.exit(1);
  }

  if (!options.outfile) {
    console.error('Must specify an output directory when compiling into a module');
    process.exit(1);
  }

  try {
    if (!fs.statSync(options.outfile).isDirectory()) {
      console.error('Output target ' + options.outfile + ' must be a directory');
      process.exit(1);
    }
  } catch (err) {
    // console.error('Output directory ' + options.outfile + ' does not exist');
    // process.exit(1);
  }

  return options;
};
