var merge = function() {
  Array.prototype.slice.call(arguments).forEach(function(m) {
    for (var i in m) if (m.hasOwnProperty(i))
      exports[i] = m[i];
  });
};

merge(require('./arithmetic'),
  require('./logic'),
  require('./literals'),
  require('./functions'),
  require('./variables'),
  require('./loops'),
  require('./structs'),
  require('./modules'),
  require('./extern'),
  require('./misc')
);

