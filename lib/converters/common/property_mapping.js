var ast = require('../../ast');

exports.use = function(map, f) {
  var convert = function(node) {
    if (!node)
      return null;

    switch (node.constructor) {
      case ast.PropertyAccessExpression:
        var property = node.right.name;
        var type = node.left.type ? node.left.type.name : '$$$';

        if (map[type]) {
          if (map[type].propertyAccess[property]) {
            var p = map[type].propertyAccess[property];

            if (typeof p == 'string') {
              // Kind of an ugly hack, but it works...
              var n = new ast.PropertyAccessExpression(node.left, new ast.Identifier(p));
              n.type = node.type;
              return convert.apply(this, [n].concat(Array.prototype.slice.call(arguments, 1)));
            } else if (typeof p == 'function') {
              var left = convert.apply(this, [node.left].concat(
                Array.prototype.slice.call(arguments, 1)));
              return p(left);
            } else {
              throw new Error('Unknown property access mapper type ' + typeof(p));
            }
          }
        }
        // FALL THROUGH

      case ast.FunctionCallExpression:
        if (node.left.type && node.left.type.name == 'method') {
          var m = node.scope.findMethod(node.left.type.generics[0], node.left.right.name);
          if (m && m.nat) {
            var type = node.left.left.type.name;
            var method = node.left.right.name;

            if (map[type]) {
              if (map[type].methodCall[method]) {
                var p = map[type].methodCall[method];

                if (typeof p == 'string') {
                  var n = new ast.PropertyAccessExpression(node.left.left, new ast.Identifier(p));
                  n.type = node.left.type;
                  n = new ast.FunctionCallExpression(n, node.args);
                  n.type = node.type;
                  return convert.apply(this, [n].concat(Array.prototype.slice.call(arguments, 1)));
                } else if (typeof p == 'function') {
                  var left = convert.apply(this, [node.left.left].concat(Array.prototype.slice.call(arguments, 1)));
                  var args = Array.prototype.slice.call(arguments, 1);
                  var self = this;
                  return p(left, args.map(function(a) {
                    return convert.apply(self, [a].concat(args));
                  }));

                } else {
                  throw new Error('Unknown property access mapper type ' + typeof(p));
                }
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
