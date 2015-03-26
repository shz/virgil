var ast = require('../ast');

/**
 * Mark and prune functions and methods that were never referenced from the main function.
 *
 * @param {Object} modules
 * @param {Object} options {rootModule, entryPoints}
 * @return {Array} Array of pruned nodes.
 */
module.exports = function prune(modules, options) {
  if (!modules) {
    throw new Error('Missing modules to prune');
  }

  var rootModule = options.rootModule;
  var entryPoints = options.entryPoints;

  if (!(rootModule instanceof ast.Module)) {
    throw new Error('Invalid rootModule in prune options');
  }
  if (!(entryPoints instanceof Array) || entryPoints.length !== 0) {
    throw new Error('Invalid entryPoints in prune options');
  }

  // Start from entryPoints, mark functions and methods that get encountered
  var node;
  for (var rootStmtIndex = 0; rootStmtIndex < rootModule.body.length; rootStmtIndex++) {
    node = rootModule.body[rootStmtIndex];
    if (node instanceof ast.FunctionStatement && entryPoints.indexOf(node.name) >= 0) {
      node.referenced = true;
      markCalledFunctions(node);
    }
  }

  // Walk through all functions, remove unreferenced functions from parent node
  return sweepUnreferencedFunctions(modules);
};


/**
 * Annotate AST by marking referenced Functions and Methods with an `referenced` flag.
 * @param rootNode
 */
function markCalledFunctions(rootNode) {
  ast.traverse(rootNode, function(node) {
    var def;
    if (node instanceof ast.FunctionCallExpression) {
      def = node.left.def;
    } else if (node instanceof ast.Identifier) {
      def = node.def;
    } else if (node instanceof ast.PropertyAccessExpression) {
      def = node.right.def;
    }

    if ((def instanceof ast.FunctionStatement || def instanceof ast.MethodStatement) && !def.referenced) {
      def.referenced = true;
      markCalledFunctions(def);
    }
  });
}


/**
 * Walk the known set of modules and prune out Function and Method nodes that were never referenced.
 * @param {Object} modules
 * @return {Array} Array of pruned nodes.
 */
function sweepUnreferencedFunctions(modules) {
  var toPrune = [];

  Object.keys(modules).forEach(function(moduleName) {
    ast.traverse(modules[moduleName], function(node, parent) {
      if (node instanceof ast.FunctionStatement) {
        if (node.referenced || (node.name === 'main' && !node.importedFrom)) {
          return;
        }
        toPrune.push({node: node, parent: parent});
      }
      if (node instanceof ast.MethodStatement) {
        if (node.referenced) {
          return;
        }
        toPrune.push({node: node, parent: parent});
      }
    });
  });

  toPrune.forEach(function(p) {
    var node = p.node;
    var parent = p.parent;
    if (parent instanceof Array) {
      var index = parent.indexOf(node);
      parent.splice(index, 1);
    }

    // TODO can method/function statements appear anywhere else?
  });

  // Return all nodes that were pruned.
  var pruned = toPrune.map(function(p) {
    return p.node;
  });

  //console.log(pruned.map(function(p) { return p.name; }));
  return pruned;
}
