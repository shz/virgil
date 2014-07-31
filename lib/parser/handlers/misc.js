var syntax = require('../../ast')
  ;

exports['eof'] = {
  lbp: 0
};

exports['comma'] = {
  lbp: 0
};

exports['lparen'] = {
  lbp: 1000,
  nud: function(value) {
    var exp = this.statement(0);
    this.expect('rparen');
    return exp;
  },
  led: function(left) {
    var args = [];

    if (!this.peek('rparen', true)) {
      do {
        args.push(this.expression(0));
      } while (this.peek('comma'));
    }
    this.expect('rparen');

    return new syntax.FunctionCallExpression(left, args);
  }
};

exports['rparen'] = {
  lbp: 0
};

exports['lsquig'] = {
  lbp: 0,
  nud: function() {
    var statements = [];
    while (!this.peek('rsquig'))
      statements.push(this.statement(0));
    return new syntax.BlockStatement(statements);
  }
};

exports['rsquig'] = {
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

exports['semicolon'] = {
  lbp: 0
};

exports['let'] = {
  nud: function() {
    var name = this.expect('identifier')[1];
    var type = 'inferred';

    if (this.peek('colon')) {
      type = this.expect('identifier');
    }

    this.expect('equals');

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

exports['equals'] = {
  lbp: 100,
  led: function(left) {
    if (!(left instanceof syntax.Identifier)) // TODO - Property access
      throw new Error('Invalid assignment; left side must be an identifier');

    return new syntax.AssignmentStatement(left, this.expression(100));
  }
}
