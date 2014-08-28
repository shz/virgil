var ast = require('../../ast')
  , canned = require('../canned')
  ;

exports.default = new ast.StringLiteral('');

exports.attributes = { length: canned['int']
                     };

exports.methods = [

];
