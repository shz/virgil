var syntax = require('../../ast')
  , types = require('../../types')
  ;

exports['eof'] = {
  lbp: 0
};

exports['void'] = {
  nud: function() {
    throw new Error('The "void" keyword is not valid here');
  }
}

exports[','] = {
  lbp: 0
};

exports['('] = {
  lbp: 1000,
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

    var node = new syntax.FunctionCallExpression(left, args);
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

exports[')'] = {
  lbp: 0
};

exports['{'] = {
  lbp: 0,
  nud: function() {
    return this.assignmentBlock(true);
  }
};

exports['}'] = {
  lbp: 0
};

exports['newline'] = {
  lbp: 0
};

exports[';'] = {
  lbp: 0
};

exports['['] = {
  lbp: 100,

  nud: function(value, loc) {
    var contents = [];

    do {
      if (this.peek(']', true))
        break;

      contents.push(this.expression())
    } while (this.peek(','));

    var tok = this.expect(']');

    var node = new syntax.ListExpression(contents);
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

    var node = new syntax.ListAccessExpression(left, right);
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

exports[']'] = {
  lbp: 0
};

exports['try'] = {
  nud: function() {
    var tryPart = this.block();
    this.expect('catch');
    var catchPart = this.block();

    var node = new syntax.TryCatchStatement(tryPart, catchPart);
    tryPart.owner = catchPart.owner = node;
    return node;
  }
};

