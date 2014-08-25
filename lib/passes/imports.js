var ast = require('../ast')
  , path = require('path')
  ;

module.exports = function(world) {
  Object.keys(world.modules).forEach(function(k) {
    var mod = world.modules[k];
    var base = path.dirname(path.join(world.base, mod.path));

    ast.traverse(mod, function(node) {
      switch (node.constructor) {
        case ast.ImportStatement:
          var moduleAst = world.modules[world.toFilename(base, node.module.join('.'))];

          if (!moduleAst) {
            var err = new Error('Unable to locate module "' + node.module.join('.') + '"');
            err.loc = node.loc;
            throw err;
          }

          node.ast = moduleAst;
          break;
      }
    });
  });
};
