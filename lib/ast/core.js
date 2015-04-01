var util = require('util');

var inherits = exports.inherits = function(thing, sup) {
  util.inherits(thing, sup);
  exports[thing.name] = thing;
};

// Base
function Node() { throw new Error('Cannot create a Node directly, use a specific subclass'); }
Node.prototype.throw = function(message) {
  throw this.error(message);
};
Node.prototype.error = function(message) {
  var err = new Error(message);
  err.loc = this.loc;
  return err;
};
Node.prototype.repr = function() {
  return '<' + this.constructor.name + '>';
};

// Top level
function Statement() { throw new Error('Cannot create a Statement directly, use a specific subclass'); }
function Expression() { throw new Error('Cannot create a Expression directly, use a specific subclass'); }

exports.Node = Node;
inherits(Statement, Node);
inherits(Expression, Node);
