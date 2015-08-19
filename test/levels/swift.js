var SwiftConverter = require('../../lib/converters/swift')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var converter = new SwiftConverter();
  var output = converter.compile(new ast.Module(input, 'file.vgl'));

  assert.equal(typeof output, 'object');
  assert.ok(Object.keys(output).length > 0);

  callback(input);
};
