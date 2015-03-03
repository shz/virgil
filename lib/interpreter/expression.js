var ast = require('../ast');

var expression = module.exports = function expression(node, slots) {
  switch (node.constructor) {
    default:
      throw new Error('Don\'t know how to execute expression ' + node.constructor.name);
  }
};
