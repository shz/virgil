var stub = function(name) {
  exports[name] = {
    attributes: {},
    methods: []
  }
};

exports.list = require('./list');
exports.str = require('./str');

stub('int');
stub('float');
stub('bool');
stub('func');
stub('method');
