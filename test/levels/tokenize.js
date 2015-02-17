var tokenizer = require('../../lib/parser/tokenizer');

module.exports = function(input, callback) {
  var tokens = tokenizer(input);

  // Ensure that each token has location info
  // TODO
  tokens.forEach(function(t) {
    if (!t.loc) {
      // throw new Error('Token ' + JSON.stringify(t) + ' is missing .loc');
    }
  });

  callback(tokens);
};
