var JSConverter = require('../../lib/converters/javascript')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var converter = new JSConverter();
  var serialized = converter.compile(new ast.Module(input, 'file.vgl'));

  assert.equal(typeof serialized, 'object');
  assert.ok(Object.keys(serialized).length > 0);

  callback(input);
};
