var javascript = require('../../lib/converters/javascript')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var serialized = javascript(input);

  assert.equal(typeof serialized, 'string');
  assert.ok(serialized.length > 0);

  callback(input);
};
