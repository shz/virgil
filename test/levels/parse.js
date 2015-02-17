var parser = require('../../lib/parser')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  var node = parser.snippet(input);

  // Ensure that each token has location info
  ast.traverse(node, function(node) {
    if (!node.loc) {
      // throw new Error('Node ' + node.constructor.name + ' is missing .loc');
    }
  });

  callback(node);
};
