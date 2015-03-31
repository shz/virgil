var path = require('path')
  , escodegen = require('escodegen')
  , ast = require('../../ast')
  , shadowPass = require('./shadow_pass')
  , statementify = require('./statementify')
  , renameUnnaturalMethod = require('./rename_unnatural_method')
  ;

module.exports = function compile(m) {
  var isModule = m instanceof ast.Module;
  if (!isModule && !(m instanceof Array)) {
    m = [m];
  }
  this.currentModule = isModule ? m : null;

  // Build the main body
  var body = [];
  (isModule ? m.body : m).forEach(function(node) {
    var s = this.convert(shadowPass(node));
    if (s) {
      body.push(statementify(s));
    }
  }, this);

  // Add exported things
  if (isModule) {
    m.body.forEach(function(n) {
      // Skip non-exported things
      if (!n.ex)
        return;

      // Skip natural methods
      if (n.constructor == ast.MethodStatement && n.nat)
        return;

      // Skip externs
      if (n.constructor == ast.ExternStatement)
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
      if (n.constructor == ast.MethodStatement && !n.nat) {
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
  }

  // Assemble the full AST and convert to Javascript
  var js = escodegen.generate({ type: 'Program', body: body }, {
    format: {
      indent: { style: '  ' }
    }
  });

  // Put the module in the right path
  if (isModule) {
    var filemap = {};
    if (m.lib) {
      filemap[path.join.apply(path, m.lib.importPath) + '.js'] = js;
    } else {
      filemap[path.relative(this.baseDir, m.filename.replace(/\.vgl$/, '.js'))] = js;
    }
    return filemap;
  } else {
    return js;
  }
};
