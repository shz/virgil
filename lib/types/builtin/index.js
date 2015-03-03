var stub = function(name) {
  exports[name] = {
    attributes: {},
    methods: []
  }
};

exports['list'] = require('./list');
exports['str'] = require('./str');
exports['int'] = require('./int');
exports['bool'] = require('./bool');
exports['float'] = require('./float');
exports['datetime'] = require('./datetime');

['list', 'str', 'int', 'bool', 'float', 'datetime'].forEach(function(n) {
  exports[n].findMethod = function(name) {
    for (var i=0; i<exports[n].methods.length; i++)
      if (exports[n].methods[i][0] == name)
        return exports[n].methods[i][1];
  };
});

stub('func');
stub('method');
