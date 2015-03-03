var ast = require('../ast');

var statement = module.exports = function statement(node, slots) {
  switch (node.constructor) {
    default:
      throw new Error('Don\'t know how to execute statement ' + node.constructor.name);
  }
};
