//
// Checks types, annotates nodes with type information
//

var ast = require('../ast')
  , types = require('../types')
  ;

module.exports = function(root) {
  var check = function(node, type) {
    // Check that non-builtin types are in scope, and store the def
    if (type && !type.def && !type.isGeneric) {
      if (types.equal(type, types.canned['inferred'])) {
        node.throw('Compiler error: inferred type escaped into the wild');
      } else if (!type.builtin) {
        var scope = node.scope.search('struct', type.name);
        if (!scope) {
          var err = new Error('Type ' + type.name + ' is not defined in this scope');
          err.start = node.loc.start;
          err.end = node.loc.end;
          throw err;
        }
        type.def = scope.structs[type.name];
      }

      if (type.generics.length)
        for (var i=0; i<type.generics.length; i++)
          check(node, type.generics[i]);
    }
  };

  ast.traverse(root, function(node) {
    check(node, node.type || node.returnType);
  });
};
