//
// Check the stdlibs of all converter languages
//

var builtin = require('../../../lib/types/builtin');
var languages = ['swift', 'javascript']; // TODO - Do cpp/javascript

// A foreach for objects
var each = function(obj, f) {
  Object.keys(obj).forEach(function(key) {
    f(key, obj[key]);
  });
};

languages.forEach(function(language) {
  test('unit', 'converters', 'stdlib', language, function() {
    var stdlib = require('../../../lib/converters/' + language + '/' + language + '_stdlib');
    assert.equal(typeof stdlib, 'object', 'Exports an object');

    each(builtin, function(name, defs) {
      assert.equal(typeof stdlib[name], 'object', 'Has definitions for ' + name);
      each(defs.attributes, function(attribute) {
        assert.equal(typeof stdlib[name][attribute], 'function', 'Has definition for attribute ' + name + '.' + attribute);
      });
      defs.methods.forEach(function(info) {
        assert.equal(typeof stdlib[name][info[0]], 'function', 'Has definition for method ' + name + '.' + info[0]);
      });
    });
  });
});
