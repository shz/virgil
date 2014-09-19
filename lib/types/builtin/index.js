var stub = function(name) {
  exports[name] = {
    attributes: {},
    methods: []
  }
};

['list', 'str', 'int', 'bool', 'float'].forEach(function(n) {
  exports[n] = require('./' + n);
  exports[n].findMethod = function(name) {
    for (var i=0; i<exports[n].methods.length; i++)
      if (exports[n].methods[i][0] == name)
        return exports[n].methods[i][1];
  };
});

stub('func');
stub('method');
