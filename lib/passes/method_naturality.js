var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    if (node instanceof ast.MethodStatement && !node.extern) {
      var typeName = node.args[0][1].name;
      var typeScope = node.scope.search('struct', typeName);

      // If the method is defined in the same scope as the struct...
      if (typeScope == node.scope)
      // ... and if the struct is not externed...
      if (!typeScope.structs[typeName].extern)
      // ... and if the exports match
      if (!typeScope.structs[typeName].ex || node.ex)
      // Then it's a natural node method
        node.nat = true;
    }
  });
};
