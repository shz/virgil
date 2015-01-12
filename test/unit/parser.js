var engine = require('./util/require')('parser/engine');

var tokens = function() {
  return Array.prototype.map.call(arguments, function(t) {
    var tok = [t, t, {}];

    if (t == 'identifier')
      tok[1] = 'zam';

    return tok;
  });
};

exports.testBasics = function(test, assert) {


  test.finish();
};
