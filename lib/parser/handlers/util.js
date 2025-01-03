var precedence = require('../precedence');

exports.binaryExpression = function(exports, operator, Class) {
  if (!Class) {
    throw new Error('Bad Class for binary expression ' + operator);
  }

  exports[operator] = {
    led: function(left, t) {
      return new Class(left, this.expression(precedence[operator]));
    }
  };
};

exports.literal = function(exports, name, Class) {
  if (!Class) {
    throw new Error('Bad Class for literal ' + name);
  }

  exports[name] = {
    nud: function(t) {
      return new Class(t);
    }
  };
};
