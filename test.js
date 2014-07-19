var Parser = require('./parser');
// var p = new Parser('(1 + 3.4) * 2');
// var p = new Parser('false ? 2 : 4 * 4 true false');
var p = new Parser('if (true) { 1 2 }')

p.parse().forEach(function(s) {
  console.log(s.toTreeString());
});
