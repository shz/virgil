var executeBlock = require('./block');

//
// Runs a function, handling return values and the like
//
module.exports = function func(node, slots, args) {
  var result = executeBlock(node.body, slots, args);
  if (result) {
    if (result.type == 'return') {
      return result.value;
    } else {
      node.throw('Encountered an invalid ' + result.type);
    }
  }
};
