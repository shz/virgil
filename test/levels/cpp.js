var cpp = require('../../lib/converters/cpp')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var serialized = cpp(input);

  assert.equal(typeof serialized, 'string');
  assert.ok(serialized.length > 0);

  callback(input);
};
