var re = [];

// Keywords
[ 'true'
, 'false'
, 'if'
, 'else'
, 'function'
, 'method'
// , 'animation'
// , 'renderer'
, 'struct'
, 'return'
, 'struct'
, 'while'
, 'for'
, 'upto'
, 'downto'
, 'break'
, 'continue'
, 'try'
, 'catch'
, 'export'
, 'import'
, 'lambda'
, 'null'
, 'void'
, 'extern'
, 'new'
, 'default'
].forEach(function(keyword) {
  re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
});

// Everything else
re = re.concat([ [/\d+(?:\.\d+f?|f)/, 'float']
               , [/\d+/, 'int']
               , [/\d+px/, 'px']
               , [/"[^\\"\r\n]*(?:\\.[^"\\]*)*"/, 'string']

               // Variable declarations

               , [/\blet(?:!|\b)/, 'let']
               , [/\bout(?:!|\b)/, 'out']
               , [/\bmut(?:!|\b)/, 'mut']

               // Identifiers

               , [/\b[a-zA-Z0-9_]+\b/, 'identifier']

               // Generics

               , [/'[A-Z]/, 'gref'] // Syntax highlighter fix -> '

               // Arithmetic

               , ['**', '**']
               , ['*', '*']
               , ['/', '/']
               , ['+', '+']
               , ['-', '-']
               , ['%', '%']

               // Logic

               , ['!=', '!=']
               , ['!', '!']
               , ['>=', '>=']
               , ['<=', '<=']
               , ['&&', '&&']
               , ['||', '||']
               , ['<', '<']
               , ['>', '>']
               , ['==', '==']

               // Bitwise

               , ['&', '&']
               , ['|', '|']

               // Comments

               , [/\#.*/, 'comment']

               // Everything else

               , ['=', '=']
               , ['(', '(']
               , [')', ')']
               , ['?', '?']
               , [',', ',']
               , [':', ':']
               , ['{', '{']
               , ['}', '}']
               , ['[', '[']
               , [']', ']']
               , ['.', '.']
               , [';', ';']
               , [/\s+/, 'whitespace']

               // Everything else raises a tokenizer error

               , [/[\S]+/, '_err']
               ]);

// Combine the various syntax components into one grand regex to
// rule them all.
var masterRe = re.map(function(r) {
  var s = null;
  if (r[0] instanceof RegExp)
    s = r[0].source;
  else
    s = r[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  return '(' + s + ')';
}).join('|');

module.exports = function tokenize(source) {
  var lines = source.split(/\r?\n/);
  var tokens = [];

  var lineNo = 0;

  var r = new RegExp(masterRe, 'g');
  var match = null;
  var lastWasSemicolon = false;

  for (var line=0; line<lines.length; line++) {
    lineNo = line + 1;
    var l = lines[line];

    // Check for and strip out continuations.  Continuations are implied
    // by one of the following:
    //
    //  * Ending the line with a \
    //  * The line containing only a comment
    var lineHasContinuation = !!l.match(/(\\\s*$)|(^\s*#.*$)/);
    if (lineHasContinuation) {
      l = l.replace(/\\\s*/, '');
    }

    while ((match = r.exec(l))) {
      for (var i=1; i<match.length; i++) {
        if (match[i]) {
          break;
        }
      }

      var start = match.index;
      var end = start + match[i].length;
      var type = re[i-1][1];

      // Handle basic unknown token case
      if (type == '_err') {
        var err = new Error('Unknown token "' + match[i] + '"');
        err.start = {
          line: lineNo,
          col: start
        };
        err.end = {
          line: lineNo,
          col: end
        };
        throw err;

      // Ignore comments
      } else if (type == 'comment') {
        // Pass

      // Everything else
      } else {
        if (type == ';')
          lastWasSemicolon = true;
        else if (type != 'whitespace')
          lastWasSemicolon = false;

        tokens.push([type, match[i], {
          line: lineNo,
          start: start,
          end: end
        }]);
      }
    }

    // Raise an error for superfluous semicolons
    if (lastWasSemicolon) {
      var err = new Error('Superfulous semicolon!');
      err.start = {
        line: lineNo,
        col: lines[line].length - 1
      };
      err.end = {
        line: lineNo,
        col: lines[line].length
      };
      // err.line = lineNo;
      // err.colStart = err.col = 0;
      // err.colEnd = lines[line].length - 1
      throw err;
    }

    // Add a newline token manually to the end of every line, as long
    // as a continuation isn't implied.
    if (!lineHasContinuation) {
      tokens.push(['newline', null, {
        line: lineNo,
        start: 0,
        end: 0
      }]);
    }
  }

  tokens.push(['eof']);
  return tokens;
};
