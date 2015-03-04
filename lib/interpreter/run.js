var ast = require('../ast')
  , executeFunction = require('./function')
  ;

//
// Runs a function directly, or a specified entry function insdie
// a module.
//
var run = module.exports = function(m, entryPoint) {
  var thingToRun = null;

  if (m instanceof ast.FunctionStatement) {
    thingToRun = m;

  } else if (m instanceof ast.Module) {
    var defScope = m.body.scope.search('function', entryPoint);
    if (!defScope) {
      throw new Error('Unable to find entry point ' + entryPoint + ' in module');
    }

    thingToRun = defScope.functions[entryPoint];

  } else {
    throw new Error('Cannot run a ' + m.constructor.name + ' directly');
  }

  return executeFunction(thingToRun);
};
