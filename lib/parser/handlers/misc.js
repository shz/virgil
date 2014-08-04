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
  lbp: 0
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
exports['struct'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    if (name[0].toLowerCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Struct names must be UpperCamelCased');
    }

    var contents = this.assignmentBlock();

    return new syntax.StructStatement(name, contents);
  }
}

/* istanbul ignore next */
exports['.'] = {
  lbp: 1,
  led: function(left) {
    var right = null;
    if (this.peek('(', true)) {
      right = this.expression(0);
      this.expect(')');
    } else {
      right = new syntax.Identifier(this.expect('identifier')[1]);
    }

    return new syntax.PropertyAccessExpression(left, right);
  }
};

/* istanbul ignore next */
exports['['] = {
  nud: function() {
    var contents = [];

    do {
      if (this.peek(']', true))
        break;

      contents.push(this.expression())
    } while (this.peek(','));

    this.expect(']');

    return new syntax.ListExpression(contents);
  }
};

/* istanbul ignore next */
exports[']'] = {
  lbp: 0
};

/* istanbul ignore next */
exports['try'] = {
  nud: function() {
    var tryPart = new syntax.BlockStatement(this.block());
    this.expect('catch');
    var catchPart = new syntax.BlockStatement(this.block());

    return new syntax.TryCatchStatement(tryPart, catchPart);
  }
};


