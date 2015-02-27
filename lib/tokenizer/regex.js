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

exports.parts = re;

// Combine the various syntax components into one grand regex to
// rule them all.
exports.source = re.map(function(r) {
  var s = null;
  if (r[0] instanceof RegExp)
    s = r[0].source;
  else
    s = r[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

  return '(' + s + ')';
}).join('|');

exports.create = function() {
  return new RegExp(exports.source, 'g');
};
