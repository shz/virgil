//
// Disallow modification of immutable variables
//

var ast = require('../ast');

var disallowed = [ ast.VariableDeclaration
                 , ast.OutVariableDeclaration
                 ];

module.exports = function(root) {
  ast.traverse(root, function(node) {
    if (node instanceof ast.AssignmentStatement)
    if (node.left.def && disallowed.indexOf(node.left.def.constructor) >= 0) {
      var err = new Error('Variable "' + node.left.name + '" is immutable.  ' +
        'Try declaring using mut instead of var.');
      err.start = node.loc.start;
      err.end = node.loc.end;
      throw err;
    }
  });
};
