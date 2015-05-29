// Explicit importation and repetition so that this can be browserified

exports['list'] = require('./list');
exports['str'] = require('./str');
exports['int'] = require('./int');
exports['bool'] = require('./bool');
exports['float'] = require('./float');
exports['datetime'] = require('./datetime');
exports['func'] = require('./func');
exports['method'] = require('./method');

['list', 'str', 'int', 'bool', 'float', 'datetime', 'func', 'method'].forEach(function(n) {
  exports[n].findMethod = function(name) {
    for (var i=0; i<exports[n].methods.length; i++)
      if (exports[n].methods[i][0] == name)
        return exports[n].methods[i][1];
  };
});

