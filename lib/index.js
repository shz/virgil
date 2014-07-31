var parser = require('./parser')
  , converters = { javascript: require('./converters/javascript')
                 }
  ;

exports.parse = function(src) {
  var s = parser(src);
  for (var i=0; i<s.length; i++) {
    console.log(s[i].repr());
  }
};

exports.compile = function(src, language) {
  if (!converters.hasOwnProperty(language))
    throw new Error('Don\'t know how to compile down to ' + language);

  var ast = parser(src);
  // for (var i=0; i<ast.length; i++)
  //   console.log(ast[i].repr());

  return converters[language](ast);
};
