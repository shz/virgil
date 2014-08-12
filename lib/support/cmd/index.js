var errors = exports.errors = require('./errors');
var options = exports.options = require('./options');
var compile = exports.compile = require('./compile');

exports.exec = function(language) {
  var opts = options.parse();
  opts.outputLanguage = language;
  compile.run(opts);
};
