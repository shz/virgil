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

  var program = parser(src);
  // for (var i=0; i<ast.length; i++)
  //   console.log(ast[i].repr());

  return converters[language](program);
};

// Allow require-ing from node
// require.extensions['.vgl'] = function(module, filename) {
//   var fs = require('fs');
//   var content = fs.readFileSync(filename, 'utf8');
//   try {
//     module._compile(exports.compile(content, 'javascript'));
//   } catch (err) {
//     err.message = filename + ': ' + err.message;
//     throw err;
//   }
// };
