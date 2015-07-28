// exports.indent = function() {
//   if (this.indent === undefined) {
//     this.indent = 0;
//   }
//   this.indent++;
// };

// exports.dedent = function() {
//   if (this.indent === undefined) {
//     this.indent = 1;
//   }
//   this.indent--;
// };

// exports.align = function(code) {
//   var indent = '';
//   for (var i=0; i<this.indent||0; i++) {
//     indent += '    ';
//   }

//   return code.split(/\r?\n/).map(function(l) {
//     if (l.length) {
//       return indent + l;
//     } else {
//       return l;
//     }
//   }).join('\n');
// };

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
