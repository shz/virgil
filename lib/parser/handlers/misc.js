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
  nud: function() {
    throw new Error('The "void" keyword is not valid here');
  }
}

exports['('] = {
  nud: function(value, loc) {
    var exp = this.expression();
    var tok = this.expect(')');
    return exp;
  },
  led: function(left, loc) {
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
  nud: function() {
    return this.assignmentBlock(true);
  }
};

exports['['] = {
  nud: function(value, loc) {
    var contents = [];

    do {
      if (this.peek(']', true))
        break;

      contents.push(this.expression())
    } while (this.peek(','));

    var tok = this.expect(']');

    return new ast.ListExpression(contents);
  },

  led: function(left, loc) {
    var right = this.expression();
    var tok = this.expect(']');

    return new ast.ListAccessExpression(left, right);
  }
};


exports['try'] = {
  nud: function() {
    var tryPart = this.block();
    this.expect('catch');
    var catchPart = this.block();

    var node = new ast.TryCatchStatement(tryPart, catchPart);
    tryPart.owner = catchPart.owner = node;
    return node;
  }
};

