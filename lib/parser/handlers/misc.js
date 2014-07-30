var syntax = require('../../ast')
  ;

exports['eof'] = {
  lbp: 0
};

exports['lparen'] = {
  lbp: 0,
  nud: function(value) {
    var exp = this.statement(0);
    this.expect('rparen');
    return exp;
  }
};

exports['rparen'] = {
  lbp: 0
};

exports['lsquig'] = {
  lbp: 0,
  nud: function() {
    var statements = [];
    while (!this.peek('rsquig'))
      statements.push(this.statement(0));
    return new syntax.BlockStatement(statements);
  }
};

exports['rsquig'] = {
  lbp: 0
};

exports['identifier'] = {
  nud: function(value) {
    return new syntax.Identifier(value);
  }
};

exports['newline'] = {
  lbp: 0
};

exports['semicolon'] = {
  lbp: 0
};

exports['let'] = {
  nud: function() {

  }
}
