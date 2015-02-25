var Token = require('./token')
  , regex = require('./regex')
  ;

module.exports = function tokenize(source) {
  var tokens = [];
  var r = regex.create();

  source.split(/\r?\n/).forEach(function(l, i) {
    var lineNumber = i + 1;
    var match = null;

    // Check for and strip out continuations.  Continuations are implied
    // by one of the following:
    //
    //  * Ending the line with a \
    //  * The line containing only a comment
    var lineHasContinuation = !!l.match(/(\\\s*$)|(^\s*#.*$)/);
    if (lineHasContinuation) {
      l = l.replace(/\\\s*/, '');
    }

    // Trim line
    l = l.replace(/^\s+/, '').replace(/\s+$/, '');

    // Parse all tokens on this line
    while ((match = r.exec(l))) {
      // Find which token we matched
      for (var i=1; i<match.length; i++) {
        if (match[i]) {
          break;
        }
      }

      var start = match.index;
      var end = start + match[i].length;
      var type = regex.parts[i - 1][1];
      var loc = {
        start: {
          line: lineNumber,
          col: start
        },
        end: {
          line: lineNumber,
          col: start + match[i].length
        }
      }

      // Handle basic unknown token case
      switch (type) {
        // Throw error on unknown token
        case '_err':
          var err = new Error('Unknown token "' + match[i] + '"');
          err.loc = loc;
          throw err;

        // Ignore comments
        case 'comment':
          break;

        // Everything else
        default:
          tokens.push(new Token(type, match[i], loc));
          break;
      }
    }

    // Semicolons are implied at end of line, raise an error if we
    // found one at the end.
    if (l.charAt(l.length - 1) == ';') {
      var err = new Error('Superfluous semicolon');
      err.loc = loc;
      throw err;
    }

    // Add a newline token manually to the end of every line, unless
    // the line ended in a continuation.
    if (!lineHasContinuation) {
      tokens.push(new Token('newline', null));
    }
  });

  // Push a final eof token to signify the end
  tokens.push(new Token('eof'));
  return tokens;
};
