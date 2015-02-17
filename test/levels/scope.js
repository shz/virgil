var scope = require('../../lib/scope')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var scoped = scope.build(input, true);

  assert.equal(!!scoped, true);

  // Ensure that each node has scope attached
  ast.traverse(input, function(node) {
    if (!node.scope) {
      throw new Error('Node ' + node.constructor.name + ' is missing .scope');
    }
  });

  callback(scoped);
};
