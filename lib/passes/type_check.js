var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    // Check that non-builtin types are in scope
    if (node.type && !node.type.builtin) {
      var scope = node.scope.search('struct', node.type.name);
      if (!scope)
        throw new Error('Type "' + node.type.name + '" is not defined in this scope');
      node.type.def = scope.structs[node.type.name];
    }
  });
};
