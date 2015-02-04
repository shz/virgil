var arithmetic = require('./arithmetic')
  , logic = require('./logic')
  , literals = require('./literals')
  , functions = require('./functions')
  , variables = require('./variables')
  , loops = require('./loops')
  , structs = require('./structs')
  , modules = require('./modules')
  , extern = require('./extern')
  , misc = require('./misc');

var merge = function(m) {
  for (var i in m) if (m.hasOwnProperty(i))
    exports[i] = m[i];
};

merge(arithmetic);
merge(logic);
merge(literals);
merge(functions);
merge(variables);
merge(loops);
merge(structs);
merge(modules);
merge(extern);
merge(misc);
