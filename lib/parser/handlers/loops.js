var syntax = require('../../ast')
  , types = require('../../types')
  , variables = require('./variables')
  ;

/* istanbul ignore next */
exports['while'] = {
  nud: function() {
    var exp = this.expression();
    var block = this.block();

    return new syntax.WhileStatement(exp, block);
  }
};

/* istanbul ignore next */
exports['for'] = {
  nud: function() {
    var decl = variables['let'].nud.call(this);
    var up = true;
    if (this.peek('downto')) {
      up = false;
    } else {
      this.expect('upto');
    }
    var end = this.expression(0)
    var block = this.block();

    return new syntax.ForStatement(decl, end, up, block);
  }
};

/* istanbul ignore next */
exports['upto'] = {};

/* istanbul ignore next */
exports['downto'] = {};

/* istanbul ignore next */
exports['break'] = {
  nud: function() {
    return new syntax.BreakStatement();
  }
};

/* istanbul ignore next */
exports['continue'] = {
  nud: function() {
    return new syntax.ContinueStatement();
  }
};
