var ast = require('../ast');

module.exports = function(world) {
  Object.keys(world.modules).forEach(function(k) {
    ast.traverse(world.modules[k], function(node) {
      if (!(node instanceof ast.ImportStatement))
        return;

      var moduleAst = world.modules[world.toFilename(node.module.join('.'))];

      if (!moduleAst) {
        var err = new Error('Unable to locate module "' + node.module + '"');
        err.loc = node.loc;
        throw err;
      }

      node.ast = moduleAst;
    });
  });
};
