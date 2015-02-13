var ast = require('../../ast');

module.exports = function(node) {
  ast.traverse(node, function(node) {
    // Only handle variables
    if (!(node instanceof ast.VariableDeclaration))
    if (!(node instanceof ast.OutVariableDeclaration))
    if (!(node instanceof ast.MutableVariableDeclaration))
      return;

    // We only worry about shadowed variables
    if (!node.override)
      return;

    // If the variable is defined in a function, method, or lambda, then
    // the JS scoping rules will take care of it already.
    var parent = node.scope.node.owner;
    if (parent instanceof ast.FunctionStatement)
      return;
    if (parent instanceof ast.LambdaExpression)
      return;
    if (parent instanceof ast.MethodStatement)
      return;

    // Find the count of the parent scope's version of this variable
    var count = 0;
    var defScope = node.scope.search('variable', node.name);
    if (!defScope) // Handle superfluous overrides
      return;
    count = defScope.variables[node.name].jsShadowCount || 0;

    // Adjust our scope count
    node.jsShadowCount = count + 1;
  });

  return node;
};
