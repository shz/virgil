var converter = require('./converter');

module.exports = function(node, g) {
  var s = '';

  // Temporarily hijack the method list
  var oldClasses = g.classes;
  g.classes = {};

  // Rollup methods
  node.methods.forEach(function(m) {
    var name = m.args[0][1].name;
    if (!g.classes[name])
      g.classes[name] = {};
    g.classes[name][m.name] = m;
  });

  // Structs
  node.structs.forEach(function(struct) {
    s += converter.convert(struct, g) + ';\n';
  });

  // Functions
  if (node.functions.length)
    s += '\n';
  node.functions.forEach(function(f) {
    s += converter.convert(f, g) + '\n';
  });

  // Variable declarations
  if (node.declarations.length)
    s += '\n';
  node.declarations.forEach(function(f) {
    s += converter.convert(f, g) + ';\n';
  });

  // Restore the class/method list
  g.classes = oldClasses;

  // Wrap in a namespace if needed
  if (node.namespace) {
    s = '\nnamespace ' + node.namespace + ' {\n' +
      g.indent(function(a) { return s }) +
      '\n}';
  }

  return s;
};
