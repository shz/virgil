var syntax = require('../../ast')
  , types = require('../../types')
  ;

exports['eof'] = {
  lbp: 0
};

exports[','] = {
  lbp: 0
};

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

exports[')'] = {
  lbp: 0
};

exports['{'] = {
  lbp: 0,
  nud: function() {
    var statements = [];
    while (!this.peek('}'))
      statements.push(this.statement(0));
    return new syntax.BlockStatement(statements);
  }
};

exports['}'] = {
  lbp: 0
};

exports['identifier'] = {
  nud: function(value) {
    return new syntax.Identifier(value);
  }
};

exports['newline'] = {
  lbp: 0
};

exports[';'] = {
  lbp: 0
};

exports['let'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    var type = types.INFERRED;

    if (this.peek(':')) {
      type = this.typeRef();
    }

    this.expect('=');

    var expression = this.expression(0);

    return new syntax.VariableDeclaration(name, type, expression);
  }
}

exports['mut'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.MutableVariableDeclaration(node.name, node.type, node.expression);
  }
};

exports['out'] = {
  nud: function() {
    var node = exports['let'].nud.call(this);
    return new syntax.OutVariableDeclaration(node.name, node.type, node.expression);
  }
};

exports['='] = {
  lbp: 100,
  led: function(left) {
    if (!(left instanceof syntax.Identifier)) // TODO - Property access
      throw new Error('Invalid assignment; left side must be an identifier');

    return new syntax.AssignmentStatement(left, this.expression(100));
  }
};

exports['struct'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    var contents = this.assignmentBlock(true);

    return new syntax.StructStatement(name, contents);
  }
}

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

exports[']'] = {
  lbp: 0
};
