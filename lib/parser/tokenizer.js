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
].forEach(function(keyword) {
  re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
});

// Everythign else
re = re.concat([ [/\d+(?:\.\d+f?|f)/, 'float']
               , [/\d+/, 'int']
               , [/"[^\\"\r\n]*(?:\\.[^"\\]*)*"/, 'string']
               , ['**', 'pow']
               , ['<', 'lessthan']
               , ['>', 'greaterthan']
               , ['=', 'equals']
               , ['*', 'mul']
               , ['/', 'div']
               , ['++', 'doubleplus']
               , ['--', 'doubleminus']
               , ['+', 'plus']
               , ['-', 'minus']
               , ['(', 'lparen']
               , [')', 'rparen']
               , ['?', 'qmark']
               , [',', 'comma']
               , [':', 'colon']
               , ['{', 'lsquig']
               , ['}', 'rsquig']
               , ['&&', 'doubleand']
               , ['&', 'singleand']
               , ['||', 'doubleor']
               , ['|', 'singleor']
               , [/\b[a-z][a-zA-Z0-9_]*\b/, 'identifier']
               , [';', 'semicolon']
               , [/\s+/, 'whitespace']
               , [/.+/, '_err']
               ]);



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

    tokens.push(['newline', null, {
      line: lineNo,
      start: 0,
      end: 0
    }]);
  }

  tokens.push(['eof']);

  return tokens;
};
