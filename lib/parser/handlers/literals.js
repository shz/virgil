var ast = require('../../ast')
  , util = require('./util')
  ;

util.literal(exports, 'default', ast.DefaultLiteral);
util.literal(exports, 'true', ast.TrueLiteral);
util.literal(exports, 'false', ast.FalseLiteral);
util.literal(exports, 'null', ast.NullLiteral);
util.literal(exports, 'int', ast.IntegerLiteral);
util.literal(exports, 'float', ast.FloatLiteral);
util.literal(exports, 'string', ast.StringLiteral);
