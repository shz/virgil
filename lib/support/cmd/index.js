var options = exports.options = require('./options');
var compile = exports.compile = require('./compile');

exports.exec = function(language) {
  var opts = options.parse();
  opts.outputLanguage = language;

  if (opts.printVersion) {
    console.log('Virgil Compiler', '-', 'Version', require('../../../package.json').version);
    console.log('Output mode:', language);
    console.log('');
    process.exit(0);
  }

  compile.run(opts);
};
