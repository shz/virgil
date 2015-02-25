var Token = module.exports = function Token(name, value, loc) {
  this.name = name;
  this.value = value || null;
  this.loc = loc || {
    start: {
      line: 0,
      col: 0
    },
    end: {
      line: 0,
      col: 0
    }
  };
};

Token.prototype = {
  constructor: Token,

  toString: function() {
    return '<' + this.name + (this.value ? (' ' + this.value) : '') + '>';
  },
  inspect: function() {
    return this.toString();
  }
};

