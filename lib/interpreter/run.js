var ast = require('../ast')
  , executeFunction = require('./function')
  , executeBlock = require('./block')
  , SlotStack = require('./slot_stack')
  ;

//
// Runs a function directly, or a specified entry function insdie
// a module.
//
var run = module.exports = function(m, entryPoint) {
  var slots = null;
  var thingToRun = null;
  entryPoint = entryPoint || 'main';

  if (m instanceof ast.FunctionStatement) {
    thingToRun = m;

  } else if (m instanceof ast.Module) {
    var defScope = m.scope.search('function', entryPoint);
    if (!defScope) {
      throw new Error('Unable to find entry point ' + entryPoint + ' in module');
    }
    thingToRun = defScope.functions[entryPoint];

    slots = new SlotStack();
    executeBlock(m, slots, null, true);
  } else {
    throw new Error('Cannot run a ' + m.constructor.name + ' directly');
  }

  return executeFunction(thingToRun, slots);
};
