var ast = require('../../ast');

var go = function(f, left, args, isProperty, name) {
  left = this.convert(left);
  args = (args || []).map(this.convert, this);

  return f(left, args, isProperty, name);
};

module.exports = function(node, stdlib) {
  if (!node) {
    return;
  }

  if (node.constructor == ast.PropertyAccessExpression) {
    var f;

    if (node.left.type)
    if (node.left.type.builtin)
    if (stdlib[node.left.type.name])
    if ((f = stdlib[node.left.type.name][node.right.name]))
    {
      return go.call(this, f, node.left, null, true, node.right.name);
    }
  } else if (node.constructor == ast.FunctionCallExpression && node.left.type.name == 'method') {
    var methodName = node.left.right.name;
    var method = node.scope.findMethod(node.left.type.generics[0], methodName);
    if (method && method.nat) {
      var type = node.left.left.type.name;
      var f;

      if (stdlib[type])
      if ((f = stdlib[type][methodName]))
      {
        return go.call(this, f, node.left.left, node.args, false, methodName);
      }
    }
  } else {
    return false;
  }
};
