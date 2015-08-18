var ast = require('../../ast');

module.exports = function(map, node) {
  if (!node)
    return null;

  switch (node.constructor) {
    case ast.PropertyAccessExpression:
      var property = node.right.name;
      var type = node.left.type ? node.left.type.name : '$$$';

      if (map[type] && map[type].propertyAccess) {
        if (map[type].propertyAccess[property]) {
          var p = map[type].propertyAccess[property];
          var left = this.convert(node.left);
          return p(left, node.left);
        }
      }
      // FALL THROUGH

    case ast.FunctionCallExpression:
      if (node.scope && node.left.type && node.left.type.name == 'method') {
        var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);
        if (m && m.nat) {
          var type = node.left.left.type.name;
          var method = node.left.right.name;

          if (map[type]) {
            if (map[type].methodCall[method]) {
              var p = map[type].methodCall[method];
              var left = this.convert(node.left.left);
              var args = Array.prototype.slice.call(arguments, 1);
              return p(left, node.args.map(this.convert, this), node.left.left);
            }
          }
        }
      }
      // FALL THROUGH

    default:
      return this._convert(node);
  }
};
