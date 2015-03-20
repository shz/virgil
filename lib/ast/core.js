var util = require('util');

var inherits = exports.inherits = function(thing, sup) {
  util.inherits(thing, sup);
  exports[thing.name] = thing;
};

// Base
function Node() {}
Node.prototype.throw = function(message) {
  throw this.error(message);
};
Node.prototype.error = function(message) {
  var err = new Error(message);
  err.loc = this.loc;
  return err;
};
Node.prototype.repr = function() {
  var s = 'Node';
  return s;
};

// Top level
function Statement() {}
function Expression() {}

exports.Node = Node;
inherits(Statement, Node);
inherits(Expression, Node);
