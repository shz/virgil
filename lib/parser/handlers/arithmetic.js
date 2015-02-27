var ast = require('../../ast')
  , precedence = require('../precedence')
  , util = require('./util')
  ;

util.binaryExpression(exports, '+', ast.AdditionExpression);
util.binaryExpression(exports, '*', ast.MultiplicationExpression);
util.binaryExpression(exports, '/', ast.DivisionExpression);
util.binaryExpression(exports, '**', ast.PowerExpression);
util.binaryExpression(exports, '%', ast.ModExpression);
util.binaryExpression(exports, '-', ast.SubtractionExpression);
exports['-'].nud = function(t) {
  return new ast.NegationExpression(this.expression(precedence['-']));
};
