var escodegen = require('escodegen')
  , shadowPass = require('../javascript/shadow_pass')
  , statementify = require('./statementify')
  , renameUnnaturalMethod = require('./rename_unnatural_method')
  ;

module.exports = function compile(module) {

  // Build the main body
  var body = [];
  for (var i=0; i<node.body.length; i++) {
    var s = this.convert(shadowPass(node).body[i]);
    if (s)
      body.push(statementify(s));
  }

  // Add exported things
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

    // Figure out the JS name of the thing being exported.
    //
    // Special cases:
    //
    //   If we're referencing not-natural methods, we need to use their
    //   correct name.
    //
    //   Shadowed variables cannot exist in root scope, by definition
    var name = n.name;
    if (n.constructor == syntax.MethodStatement && !n.nat) {
      name = renameUnnaturalMethod(n);
    }

    // Push an export assigner
    body.push({
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'exports' },
          property: { type: 'Identifier', name: name }
        },
        right: { type: 'Identifier', name: name }
      }
    });
  });

  // Assemble the full AST and convert to Javascript
  var js = escodegen.generate({ type: 'Program', body: body }, {
    format: {
      indent: { style: '  ' }
    }
  });

  // Map extension -> contents
  return {
    js: js
  }
};
