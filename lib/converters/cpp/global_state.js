var ast = require('../../ast');

var GlobalState = module.exports = function() {
  this.libIncludes = {};
  this.localIncludes = {};
  this.classes = {};
};

GlobalState.prototype = {
  indent: function(f) {
    return (f() || '').split('\n')
                      .map(function(l) { return '  ' + l })
                      .join('\n');
  },
  methodRollup: function(root) {
    var classes = this.classes;

    ast.traverse(root, function(node) {
      if (node.constructor == ast.MethodStatement && node.nat) {
        var name = node.args[0][1].name;
        if (!classes[name])
          classes[name] = {};
        classes[name][node.name] = node;
      }
    });
  }
};
