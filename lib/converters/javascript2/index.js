var escodegen = require('escodegen')
  , Converter = require('../common/converter')
  , propertyMapping = require('../common/property_mapping')
  ;

var JavascriptConverter = module.exports = function JavascriptConverter(options) {
  this.options = options;
};
var proto = JavascriptConverter.prototype = new Converter('javascript');
proto.constructor = JavascriptConverter;



proto.compile = function(node, options) {
  // Convert JS ast into a string
  var js = escodegen.generate(jsnode, {
    format: {
      indent: {
        style: '  '
      }
    }
  });
};

proto.convert = propertyMapping.use(require('../javascript/js_map'), function(node) {

});

proto.mixin(require('./expressions'));
