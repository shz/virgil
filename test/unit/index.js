var fs = require('fs')
  , path = require('path')
  ;

var loadDir = function(p) {
  fs.readdirSync(p).forEach(function(f) {
    if (f.match(/\.js$/) && f != 'index.js') {
      var r = path.join(p, f);
      require(r);
    }
  });
};

loadDir(__dirname);
loadDir(path.join(__dirname, 'tokenizer'));
loadDir(path.join(__dirname, 'runtime', 'javascript'));
loadDir(path.join(__dirname, 'converters'));
loadDir(path.join(__dirname, 'converters', 'javascript'));
loadDir(path.join(__dirname, 'converters', 'cpp'));
