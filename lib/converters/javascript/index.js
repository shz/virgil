var fs = require('fs'); // Must be own statement for brfs workaround
var path = require('path')
  , escodegen = require('escodegen')
  , ast = require('../../ast')
  , Converter = require('../common/converter')
  , propertyMapping = require('../common/property_mapping')
  ;

//
// Available options:
//
//  * baseDir - Required, base dir for source code (Truly requireD?)
//
var JavascriptConverter = module.exports = function JavascriptConverter(options) {
  options = options || {};

  this.options = options;
  this.baseDir = options.baseDir || '.';
  this.currentModule = null;
  this.needDateTime = false;
};
var proto = JavascriptConverter.prototype = new Converter('javascript');
proto.constructor = JavascriptConverter;

proto.convert = propertyMapping.use(require('../javascript/js_map'), function(node) {
  if (node instanceof ast.Literal) {
    return this.literal(node);
  } else if (node instanceof ast.Expression) {
    return this.expression(node);
  } else if (node instanceof ast.Statement) {
    return this.statement(node);
  } else if (node instanceof ast.Node) {
    node.throw('Don\'t know how to convert a ' + node.constructor.name);
  } else {
    throw new Error('Don\'t know how to convert a ' + node.constructor.name);
  }
});

proto.postProcess = require('./post_process');
proto.compile = require('./compile');

proto.mixin(require('./makers'));
proto.mixin(require('./module_utils'));
proto.mixin(require('./literals'));
proto.mixin(require('./expressions'));
proto.mixin(require('./statements'));

proto.libs = {
  datetime: fs.readFileSync(
    path.join(__dirname, '..', '..', '..', 'runtime', 'javascript', 'datetime.js'), {encoding: 'utf8'})
};
