//
// Perform escape analysis on variables in blocks
//

var ast = require('../ast');

var EscapeInfo = function() {

};

module.exports = function(root) {
  ast.traverse(root, function(node) {
    // TODO - Do it for each scope
  });
};

