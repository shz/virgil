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

  mixin: function(thing) {
    for (var i in thing) if (thing.hasOwnProperty(i)) {
      this[i] = thing[i];
    }
  },

  compile: function(module) {
    module.throw('This ' + this.name + ' converter sucks');
  },
  postProcess: function(filemap) {
    return filemap;
  }
};
