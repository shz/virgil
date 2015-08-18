var ast = require('../../ast');

exports.natural = function(node) {
  ast.traverse(node, function(node) {
    if (node.constructor == ast.MethodStatement && node.nat && !node.extern) {
      var struct = node.args[0][1].def;
      if (!struct._naturalMethods) {
        struct._naturalMethods = {};
      }
      struct._naturalMethods[node.name] = node;
    }
  });
};

exports.unnatural = function(node) {
  var blocks = [node];

  ast.traverse(node, function(node) {
    if (node.constructor == ast.BlockStatement) {
      blocks.push(node);
    }
    var block = blocks[blocks.length - 1];

    if (node.constructor == ast.MethodStatement && !node.nat && !node.extern) {
      var type = node.args[0][1];
      if (!block._unnaturalMethods) {
        block._unnaturalMethods = {};
      }
      if (!block._unnaturalMethods[type.name]) {
        block._unnaturalMethods[type.name] = [];
      }
      block._unnaturalMethods[type.name].push(node);
    }
  },
  function(node) {
    if (node.constructor == ast.BlockStatement) {
      blocks.pop();
    }
  });
};
