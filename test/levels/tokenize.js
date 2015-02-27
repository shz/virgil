var tokenizer = require('../../lib/tokenizer');

module.exports = function(input, callback) {
  var tokens = tokenizer(input);

  // Ensure that each token has location info
  tokens.forEach(function(t) {
    if (!t.loc) {
      throw new Error('Token ' + t + ' is missing .loc');
    }
  });

  callback(tokens);
};
