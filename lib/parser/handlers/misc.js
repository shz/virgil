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
    exp.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: tok[2].line,
        col: tok[2].end
      }
    };
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

    var node = new ast.FunctionCallExpression(left, args);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: end[2].line,
        col: end[2].end
      }
    };
    return node;
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

    var node = new ast.ListExpression(contents);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: tok[2].line,
        col: tok[2].end
      }
    };
    return node;
  },

  led: function(left, loc) {
    var right = this.expression();
    var tok = this.expect(']');

    var node = new ast.ListAccessExpression(left, right);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: tok[2].line,
        col: tok[2].end
      }
    };
    return node;
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

