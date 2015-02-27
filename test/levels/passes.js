var passes = require('../../lib/passes')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  passes.list.forEach(function(pass) {
    pass(input);
  });

  // Checks
  ast.traverse(input, function(node) {
    if (node instanceof ast.Identifier) {
      assert.isDefined(node.def);
      assert.ok(node.def instanceof ast.Node);
    }
  });

  callback(input);
};
