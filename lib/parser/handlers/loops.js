var syntax = require('../../ast')
  , types = require('../../types')
  , variables = require('./variables')
  ;

exports['while'] = {
  nud: function() {
    var exp = this.expression();
    var block = new syntax.BlockStatement(this.block());

    return new syntax.WhileStatement(exp, block);
  }
};

exports['for'] = {
  nud: function() {
    var decl = variables['let'].nud.call(this);
    var up = true;
    if (this.peek('downto')) {
      up = false;
    } else {
      this.expect('to');
    }
    var end = this.expression(0)
    var block = new syntax.BlockStatement(this.block());

    return new syntax.ForStatement(decl, end, up, block);
  }
};

exports['to'] = {};
exports['downto'] = {};

exports['break'] = {
  nud: function() {
    return new syntax.BreakStatement();
  }
};

exports['continue'] = {
  nud: function() {
    return new syntax.ContinueStatement();
  }
};
