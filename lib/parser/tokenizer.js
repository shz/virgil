var re = [];

// Keywords
[ 'true'
, 'false'
, 'if'
, 'else'
].forEach(function(keyword) {
  re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
});

// Everythign else
re = re.concat([ [/\d+\.\d+/, 'float']
               , [/\d+/, 'int']
               , ['**', 'pow']
               , ['*', 'mul']
               , ['/', 'div']
               , ['++', 'doubleplus']
               , ['--', 'doubleminus']
               , ['+', 'plus']
               , ['-', 'minus']
               , ['(', 'lparen']
               , [')', 'rparen']
               , ['?', 'qmark']
               , [':', 'colon']
               , ['{', 'lsquig']
               , ['}', 'rsquig']
               , ['&&', 'doubleand']
               , ['&', 'singleand']
               , ['||', 'doubleor']
               , ['|', 'singleor']
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

  while ((match = r.exec(source))) {
    for (var i=1; i<match.length; i++) {
      if (match[i]) {
        break;
      }
    }

    var start = match.index;
    var end = start + match[i].length;

    if (re[i-1][1] == '_err') {
      var err = new Error('Unknown token ' + match[i]);
      err.line = lineNo;
      err.colStart = err.col = start;
      err.colEnd = end;
      throw err;
    } else {
      tokens.push([re[i-1][1], match[i], {
        line: lineNo,
        start: start,
        end: end
      }]);
    }
  }


  tokens.push(['eof']);

  return tokens;
};
