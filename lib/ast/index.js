var util = require('util').util;

var inherits = function(thing, sup) {
  if (typeof thing == 'function') {
    util.inherits(thing, sup);
  } else {
    for (var i in thing) {
      if (thing.hasOwnProperty(i) && typeof thing == 'function') {
        util.inherits(thing[i], sup);
      }
    }
  }
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
function Module() {} inherits(Module, Node);
function Statement() {} inherits(Statement, Node);
function Expression() {} inherits(Expression, Node);

// Mid level
function Literal() {} inherits(Literal, Expression);

// The rest
inherits(require('./literals'), Literal);
