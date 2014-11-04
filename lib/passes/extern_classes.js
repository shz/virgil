//
// Ensure that externed methods are defined in the same block as
// the struct they operate on.
//

var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    if (node instanceof ast.ExternStatement) {
      var structNames = node.structs.map(function(s) {
        return s.name;
      });

      node.methods.forEach(function(m) {
        if (structNames.indexOf(m.args[0][1].name) == -1)
          throw new Error('Extern methods may only be declared on structs' +
            ' in the same extern block.  The method ' + m.name + ' is' +
            ' declared on type ' + m.args[0][1] + ' which is not defined' +
            ' in this extern block');
      });
    }
  });
};
