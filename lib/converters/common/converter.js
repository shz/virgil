var methodSweep = require('./method_sweep')
  , propertyMapping = require('./property_mapping')
  ;

var Converter = module.exports = function Converter(name, util) {
  util = util || {};
  this.name = name;
  this.utilities = {
    sweepNaturalMethods: !!util.sweepNaturalMethods,
    sweepUnnaturalMethods: !!util.sweepUnnaturalMethods,
    propertyMap: util.propertyMap
  };
};

Converter.prototype = {
  constructor: Converter,

  toString: function() {
    return '<Converter (' + this.name + ')>';
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
  // Used to convert a single node to its language-specific output form.
  // This calls _convert() under the hood, with all utilities applied.
  //
  convert: function(node) {
    if (this.utilities.propertyMap) {
      return propertyMapping.call(this, this.utilities.propertyMap, node);
    } else {
      return this._convert(node);
    }
  },

  //
  // Used to convert a Module to a map of extension to filecontent
  //
  compile: function(module) {
    if (this.utilities.sweepNaturalMethods) {
      methodSweep.natural(module);
    }
    if (this.utilities.sweepUnnaturalMethods) {
      methodSweep.unnatural(module);
    }

    return this._compile(module);
  },

  //
  // Implement yourself!  Takes in a module, returns a map of extension
  // to file content.
  //
  _compile: function(module) {
    module.throw('This ' + this.name + ' converter sucks');
  },

  //
  // Implement yourself!  Takes in a node, converts to whatever the
  // language-specific output shoudl be (string, AST, etc).
  //
  _convert: function(node) {
    node.throw('This ' + this.name + ' converter sucks');
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
