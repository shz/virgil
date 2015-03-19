var escodegen = require('escodegen')
  , shadowPass = require('../javascript/shadow_pass')
  , statementify = require('./statementify')
  , renameUnnaturalMethod = require('./rename_unnatural_method')
  ;

module.exports = function compile(module) {
  // Base JS program
  var jsnode = {
    type: 'Program',
    body: []
  };


  // Find exports
  var exports = [];
  node.body.forEach(function(n) {
    // Skip non-exported things
    if (!n.ex)
      return;

    // Skip natural methods
    if (n.constructor == syntax.MethodStatement && n.nat)
      return;

    // Skip externs
    if (n.constructor == syntax.ExternStatement)
      return;

    var name = n.name;

    if (n.constructor == syntax.MethodStatement && !n.nat) {
      // If we're referencing not-natural methods, we need to use their
      // correct name.
      name = renameUnnaturalMethod(n);
    }

    exports.push({
      type: 'Property',
      key: { type: 'Identifier', name: name },
      value: { type: 'Identifier', name: name }
    });
  });

  // Build the main body
  var moduleName = node.path.replace(/\.vgl$/, '').split(path.sep);
  moduleName = moduleName[moduleName.length - 1];
  moduleName = '$m' + moduleName[0].toUpperCase() + moduleName.substr(1);
  var body = [];
  for (var i=0; i<node.body.length; i++) {
    var s = this.convert(shadowPass(node).body[i]);
    if (s)
      body.push(statementify(s));
  }

  // Assemble the full JS AST
  var jsnode = {
    type: 'Program',
    body: body
  };

  // Turn Javascript AST to a string
  return escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};
