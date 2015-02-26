var syntax = require('../../ast')
  , types = require('../../types')
  , variables = require('./variables')
  ;

exports['while'] = {
  nud: function() {
    var exp = this.expression();
    var block = this.block();
    var node = new syntax.WhileStatement(exp, block);
    block.owner = node;
    return node;
  }
};

exports['for'] = {
  nud: function(value, loc) {
    var decl = variables['let'].nud.call(this, value, loc);
    var up = true;
    if (this.peek('downto')) {
      up = false;
    } else {
      this.expect('upto');
    }
    var end = this.expression(0)
    var block = this.block();
    var node = new syntax.ForStatement(decl, end, up, block);
    decl.from = node;
    block.owner = node;
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: block.end
    };
    return node;
  }
};

// These are parsed inline and never on their own, just here for
// the sake of completeness.
exports['upto'] = {};
exports['downto'] = {};

exports['break'] = {
  nud: function(value, loc) {
    var node = new syntax.BreakStatement();
    node.loc = loc;
    return node;
  }
};

exports['continue'] = {
  nud: function(value, loc) {
    var node = new syntax.ContinueStatement();
    node.loc = loc;
    return node;
  }
};
