exports.indent = function(code) {
  var indent = '    ';
  return code.split(/\r?\n/).map(function(l) {
    if (l.length) {
      return indent + l;
    } else {
      return l;
    }
  }).join('\n');
};
