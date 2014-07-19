var re = [];

// Keywords
[ 'true'
, 'false'
, 'if'
].forEach(function(keyword) {
  re.push([new RegExp('\\b' + keyword + '\\b'), keyword]);
});

// Everythign else
re = re.concat([ [/\d+\.\d+/, 'float']
               , [/\d+/, 'int']
               , ['*', 'mul']
               , ['/', 'div']
               , ['+', 'plus']
               , ['-', 'minus']
               , ['**', 'pow']
               , ['(', 'lparen']
               , [')', 'rparen']
               , ['?', 'qmark']
               , [':', 'colon']
               , ['{', 'lsquig']
               , ['}', 'rsquig']
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

  var r = new RegExp(masterRe, 'g');
  var match = null;

  while ((match = r.exec(source))) {
    for (var i=1; i<match.length; i++) {
      if (match[i]) {
        break;
      }
    }

    if (re[i-1][1] == '_err') {
      throw new Error('Unknown token');
    }
    tokens.push([re[i-1][1], match[i]]);
  }


  tokens.push(['eof']);

  return tokens;
};
