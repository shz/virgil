var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['eof'] = {
  lbp: 0
};

/* istanbul ignore next */
exports[','] = {
  lbp: 0
};

/* istanbul ignore next */
exports['('] = {
  lbp: 1000,
  nud: function(value) {
    var exp = this.statement(0);
    this.expect(')');
    return exp;
  },
  led: function(left) {
    var args = [];

    if (!this.peek(')', true)) {
      do {
        args.push(this.expression(0));
      } while (this.peek(','));
    }
    this.expect(')');

    return new syntax.FunctionCallExpression(left, args);
  }
};

/* istanbul ignore next */
exports[')'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['{'] = {
  lbp: 0,
  nud: function() {
    return this.assignmentBlock(true);
  }
};

/* istanbul ignore next */
exports['}'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['newline'] = {
  lbp: 0
};

/* istanbul ignore next */
exports[';'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['['] = {
  lbp: 100,

  nud: function() {
    var contents = [];

    do {
      if (this.peek(']', true))
        break;

      contents.push(this.expression())
    } while (this.peek(','));

    this.expect(']');

    return new syntax.ListExpression(contents);
  },

  led: function(left) {
    var right = this.expression();
    this.expect(']');

    return new syntax.ListAccessExpression(left, right);
  }
};

/* istanbul ignore next */
exports[']'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['try'] = {
  nud: function() {
    var tryPart = this.block();
    this.expect('catch');
    var catchPart = this.block();

    return new syntax.TryCatchStatement(tryPart, catchPart);
  }
};


