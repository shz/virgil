var Converter = module.exports = function Converter(name) {
  this.name = name;
};

Converter.prototype = {
  constructor: Converter,

  toString: function() {
    return 'Converter (' + this.name + ')';
  },
  inspect: function() {
    return this.toString();
  },
  convert: function(node) {
    node.throw('This ' + this.name + ' converter sucks');
  },
  compile: function(program) {
    node.throw('This ' + this.name + ' converter sucks');
  }
};
