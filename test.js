var Parser = require('./parser');
var p = new Parser('(1 + 3.4) * 2');

console.log(p.parse()[0].toTreeString());
