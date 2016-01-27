var util = require('util');

var inherits = exports.inherits = function(thing, sup) {
  util.inherits(thing, sup);
  exports[thing.name] = thing;
};

var thingEqual = function(a, b) {
  // Sanity check; handle nulls, undefined's.  Note that we actually
  // want the type coercion here.
  if ((a && !b) || (!a && b)) {
    return false;
  }

  // Regular check
  if (a instanceof Node) {
    if (!a.deepEqual(b)) {
      return false;
    }
  } else if (a instanceof Array) {
    if (a.length != b.length) {
      return false;
    }
    for (var i=0; i<a.length; i++) {
      if (!thingEqual(a[i], b[i])) {
        return false;
      }
    }
  } else {
    if (a !== b) {
      return false;
    }
  }

  return true;
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
Node.prototype.deepEqual = function(other) {
  if (this === other) {
    return true;
  }
  if (!other) {
    return false;
  }
  if (this.constructor !== other.constructor) {
    return false;
  }

  for (var key in this) if (this.hasOwnProperty(key)) {
    if (!thingEqual(this[key], other[key])) {
      return false;
    }
  }

  return true;
};

// Top level
function Statement() { throw new Error('Cannot create a Statement directly, use a specific subclass'); }
function Expression() { throw new Error('Cannot create a Expression directly, use a specific subclass'); }

exports.Node = Node;
inherits(Statement, Node);
inherits(Expression, Node);
