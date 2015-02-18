var passes = require('../../lib/passes')
  , ast = require('../../lib/ast')
  ;

module.exports = function(input, callback) {
  passes.list.forEach(function(pass) {
    pass(input);
  });

  callback(input);
};
