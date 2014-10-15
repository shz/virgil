var ast = require('../../ast');

exports.use = function(map, f, extra) {
  var convert = function(node) {
    if (!node)
      return null;

    switch (node.constructor) {
      case ast.PropertyAccessExpression:
        var property = node.right.name;
        var type = node.left.type ? node.left.type.name : '$$$';

        if (map[type] && map[type].propertyAccess) {
          if (map[type].propertyAccess[property]) {
            var p = map[type].propertyAccess[property];
            var left = convert.apply(this, [node.left].concat(
              Array.prototype.slice.call(arguments, 1)));
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
                var left = convert.apply(this, [node.left.left].concat(Array.prototype.slice.call(arguments, 1)));
                var args = Array.prototype.slice.call(arguments, 1);
                var self = this;
                return p(left, node.args.map(function(a) {
                  return convert.apply(self, [a].concat(args));
                }), node.left.left);
              }
            }
          }
        }
        // FALL THROUGH

      default:
        return f.apply(this, arguments);
    }
  };

  return convert;
}
