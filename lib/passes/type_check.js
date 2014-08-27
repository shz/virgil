var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    // Check that non-builtin types are in scope
    if (node.type && !node.type.builtin && !node.type.def && node.type.name[0] != '\'') {
      var scope = node.scope.search('struct', node.type.name);
      if (!scope) {
        var err = new Error('Type "' + node.type.name + '" is not defined in this scope');
        err.start = node.loc.start;
        err.end = node.loc.end;
        throw err;
      }
      node.type.def = scope.structs[node.type.name];
    }
  });
};
