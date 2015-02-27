var ast = require('../../ast')
  , types = require('../../types')
  , variables = require('./variables')
  ;

exports['while'] = {
  nud: function(t) {
    var exp = this.expression();
    var block = this.block();
    var node = new ast.WhileStatement(exp, block);
    block.owner = node;
    return node;
  }
};

exports['for'] = {
  nud: function(t) {
    var decl = variables['let'].nud.call(this, t);
    var up = true;
    if (this.peek('downto')) {
      up = false;
    } else {
      this.expect('upto');
    }
    var end = this.expression(0)
    var block = this.block();
    var node = new ast.ForStatement(decl, end, up, block);
    decl.from = node;
    block.owner = node;
    return node;
  }
};

// These are parsed inline and never on their own, just here for
// the sake of completeness.
exports['upto'] = {};
exports['downto'] = {};

exports['break'] = {
  nud: function(t) {
    return new ast.BreakStatement();
  }
};

exports['continue'] = {
  nud: function(t) {
    return new ast.ContinueStatement();
  }
};
