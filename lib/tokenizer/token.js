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
    var val = '';
    if (this.value && this.value != this.name) {
      val = ' ' + this.value;
    }
    return '<' + this.name + val + '>';
  },
  inspect: function() {
    return this.toString();
  }
};

