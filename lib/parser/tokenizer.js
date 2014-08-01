var re = [];

// Keywords
[ 'true'
, 'false'
, 'if'
, 'else'
, 'function'
, 'animation'
, 'renderer'
, 'struct'
, 'return'
, 'returns'
, 'let'
, 'out'
, 'mut'
, 'struct'
, 'while'
].forEach(function(keyword) {
  re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
});

// Everything else
re = re.concat([ [/\d+(?:\.\d+f?|f)/, 'float']
               , [/\d+/, 'int']
               , [/\d+px/, 'px']
               , [/"[^\\"\r\n]*(?:\\.[^"\\]*)*"/, 'string']
               , [/\b[a-zA-Z0-9_]+\b/, 'identifier']

               // Arithmetic

               , ['**', '**']
               , ['*', '*']
               , ['/', '/']
               , ['+', '+']
               , ['-', '-']

               // Logic

               , ['&&', '&&']
               , ['||', '||']
               , ['<', '<']
               , ['>', '>']

               // Bitwise

               , ['&', '&']
               , ['|', '|']

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

               , [/.+/, '_err']
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

  for (var line=0; line<lines.length; line++) {
    lineNo = line + 1;
    var l = lines[line].split('#')[0];

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
        err.line = lineNo;
        err.colStart = err.col = start;
        err.colEnd = end;
        throw err;

      // Everything else
      } else {
        tokens.push([type, match[i], {
          line: lineNo,
          start: start,
          end: end
        }]);
      }
    }

    // Add a newline token manually to the end of every line
    tokens.push(['newline', null, {
      line: lineNo,
      start: 0,
      end: 0
    }]);
  }

  tokens.push(['eof']);
  return tokens;
};
