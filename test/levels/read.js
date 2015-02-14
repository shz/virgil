var fs = require('fs');

module.exports = function(filename, callback) {
  fs.readFile(filename, {encoding: 'utf8'}, function(err, content) {
    if (err) throw err;
    callback(content);
  });
};
