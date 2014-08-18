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

stub('func');
stub('method');
