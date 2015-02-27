var ast = require('../../ast')
  , types = require('../../types')
  ;

exports['eof'] = {};
exports[','] = {};
exports['}'] = {};
exports['newline'] = {};
exports[';'] = {};
exports[']'] = {};
exports[')'] = {};

exports['void'] = {
  nud: function(t) {
    throw new Error('The "void" keyword is not valid here');
  }
}

exports['('] = {
  nud: function(t) {
    var exp = this.expression();
    var tok = this.expect(')');
    return exp;
  },
  led: function(left, t) {
    var args = [];

    if (!this.peek(')', true)) {
      do {
        args.push(this.expression(0));
      } while (this.peek(','));
    }
    var end = this.expect(')');

    return new ast.FunctionCallExpression(left, args);
  }
};


exports['{'] = {
  nud: function(t) {
    return this.assignmentBlock(true);
  }
};

exports['['] = {
  nud: function(t) {
    var contents = [];

    do {
      if (this.peek(']', true))
        break;

      contents.push(this.expression())
    } while (this.peek(','));

    var tok = this.expect(']');

    return new ast.ListExpression(contents);
  },

  led: function(left, t) {
    var right = this.expression();
    var tok = this.expect(']');

    return new ast.ListAccessExpression(left, right);
  }
};


exports['try'] = {
  nud: function(t) {
    var tryPart = this.block();
    this.expect('catch');
    var catchPart = this.block();

    var node = new ast.TryCatchStatement(tryPart, catchPart);
    tryPart.owner = catchPart.owner = node;
    return node;
  }
};

