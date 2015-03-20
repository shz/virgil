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

  //
  // Implement yourself!  Takes in a module, returns a map of extension
  // to file content.
  //
  compile: function(module) {
    module.throw('This ' + this.name + ' converter sucks');
  },

  //
  // Perform global postprocessing on the whole set of files produced
  // by a compilation.  The filemap argument is of the form file => contents
  // as a string.
  //
  postProcess: function(filemap) {
    return filemap;
  }
};
