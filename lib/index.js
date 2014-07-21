var parser = require('./parser')
  , converters = { javascript: require('./converters/javascript')
                 }
  ;

exports.compile = function(src, language) {
  if (!converters.hasOwnProperty(language))
    throw new Error('Don\'t know how to compile down to ' + language);

  return converters[language](parser(src));
};
