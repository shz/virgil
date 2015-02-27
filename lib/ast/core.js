var util = require('util');

var inherits = exports.inherits = function(thing, sup) {
  util.inherits(thing, sup);
  exports[thing.name] = thing;
};

// Base
function Node() {}
Node.prototype.throw = function(message) {
  var err = new Error(message);
  err.loc = this.loc;
  throw err;
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
