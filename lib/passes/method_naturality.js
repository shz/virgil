var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    if (node instanceof ast.MethodStatement && !node.extern) {
      // Ah!  This means the node.nat may be incorrect (false negative).
      // Look for the case where .nat should be set to true:
      // >> non-externed method declared in very same scope as its non-externed struct
      var relatedTypeName = node.args[0][1].name;
      var relatedTypeScope = node.scope.search('struct', relatedTypeName);
      var relatedType = node.args[0][1];

      if (relatedTypeScope == node.scope) {
        if (!relatedTypeScope.structs[relatedTypeName].extern) {
          node.nat = true;
        } else {
          // In this case, the method is not extern but the owner struct
          // is extern, so node.nat must NOT be set to true.
        }
      }
    }
  });
};
