exports.parse = function() {
  // Defaults
  var options = {
    debug: false,
    module: false,
    node: false,
    outfile: null,
    watch: false,
    args: []
  };

  var printUsage = function() {
    console.log('Usage:', process.argv[1], '[-o|--output OUTFILE] [-w|--watch] [-d|--debug] [-m|--module] FILE');
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

      case '-m':
      case '--module':
        options.module = true;
        break;

      case '-w':
      case '--watch':
        options.watch = true;
        break;

      case '-o':
      case '--output':
        next = function(arg) {
          options.outfile = arg;
        }
        break;

      case '--node':
        options.node = true;
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

  if (!options.args.length) {
    console.error('No input file(s) specified');
    printUsage();
    process.exit(1);
  }

  return options;
};