module.exports = require('./core');

require('./literals');
require('./arithmetic');
require('./logic');
require('./functions');
require('./variables');
require('./loops');
require('./lists');
require('./modules');
require('./structs');
require('./misc');

// Lazy load traverse
module.exports.traverse = function() {
  require('./traverse').apply(this, arguments);
};
