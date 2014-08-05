var merge = function(module) {
  var m = require('./' + module);

  for (var i in m) if (m.hasOwnProperty(i))
    exports[i] = m[i];
};

merge('arithmetic');
merge('logic');
merge('literals');
merge('functions');
merge('variables');
merge('loops');
merge('structs');
merge('modules');
merge('misc');
