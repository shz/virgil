var ast = require('../ast');

module.exports = function(root) {
  ast.traverse(root, function(node) {
    switch (node.constructor) {
      case ast.StructStatement:
        if (node.generics.length)
          console.log(node.generics);
        break;
    }
  });
};
