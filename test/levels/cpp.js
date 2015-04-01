var CPPConverter = require('../../lib/converters/cpp')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var converter = new CPPConverter();
  var serialized = converter.compile(new ast.Module(input, 'file.vgl'));

  assert.equal(typeof serialized, 'object');
  assert.ok(Object.keys(serialized).length > 0);

  callback(input);
};
