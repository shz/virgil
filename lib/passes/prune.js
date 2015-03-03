var ast = require('../ast');

/**
 * Mark and prune functions and methods that were never invoked from the main function.
 *
 * @param {Object} modules
 * @param {String} rootModuleName
 * @return {Array} Array of pruned nodes.
 */
module.exports = function prune(modules, rootModule) {
  // Start from main(), mark fns and methods that get encountered
  var node;
  for (var rootStmtIndex = 0; rootStmtIndex < rootModule.body.length; rootStmtIndex++) {
    node = rootModule.body[rootStmtIndex];
    if (node instanceof ast.FunctionStatement && node.name === "main") {
      node.invoked = true;
      markCalledFunctions(node);
      break;
    }
  }

  // Walk through all fns, remove uninvoked fns from parent node
  return sweepUninvokedFunctions(modules);
};


/**
 * Annotate AST by marking invoked Functions and Methods with an `invoked` flag.
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

    if ((def instanceof ast.FunctionStatement || def instanceof ast.MethodStatement) && !def.invoked) {
      def.invoked = true;
      markCalledFunctions(def);
    }
  });
}


/**
 * Walk the known set of modules and prune out Function and Method nodes that were never invoked.
 * @param {Object} modules
 * @return {Array} Array of pruned nodes.
 */
function sweepUninvokedFunctions(modules) {
  var toPrune = [];

  Object.keys(modules).forEach(function(moduleName) {
    ast.traverse(modules[moduleName], function(node, parent) {
      if (node instanceof ast.FunctionStatement) {
        if (node.invoked || (node.name === "main" && !node.importedFrom)) {
          return;
        }
        toPrune.push({node: node, parent: parent});
      }
      if (node instanceof ast.MethodStatement) {
        if (node.invoked) {
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
