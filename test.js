var Parser = require('./parser');
// var p = new Parser('(1 + 3.4) * 2');
// var p = new Parser('false ? 2 : 4 * 4 true false');
// var p = new Parser('if (true && false) { false || true }')
var p = new Parser('if (true) true else false');

// p.parse().forEach(function(s) {
//   console.log(s.toTreeString());
// });

console.log(require('./javascript_converter')(p.parse()));
