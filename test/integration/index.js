var fs = require('fs');

fs.readdirSync(__dirname).forEach(function(f) {
  if (f.match(/\.js$/) && f != 'index.js')
    require('./' + f);
});
