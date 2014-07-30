var merge = function(module) {
  var m = require('./' + module);

  for (var i in m) if (m.hasOwnProperty(i))
    exports[i] = m[i];
};

merge('arithmetic');
merge('functions');
merge('misc');
