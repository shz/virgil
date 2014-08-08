var syntax = require('../../ast')
  , types = require('../../types')
  ;

/* istanbul ignore next */
exports['identifier'] = {
  nud: function(value, loc) {
    var node = new syntax.Identifier(value);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: {
        line: loc.line,
        col: loc.end
      }
    };
    return node;
  }
};

/* istanbul ignore next */
exports['let'] = {
  nud: function(content, loc) {
    var name = this.expect('identifier')[1];
    if (name[0].toUpperCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Variable names must be lowerCamelCased');
    }

    var type = types.canned['inferred'];
    if (this.peek(':')) {
      type = this.typeRef();
    }

    this.expect('=');

    var expression = this.expression(0);

    var node = new syntax.VariableDeclaration(name, type, expression);
    node.loc = {
      start: {
        line: loc.line,
        col: loc.start
      },
      end: expression.loc.end
    };
    return node;
  }
}

/* istanbul ignore next */
exports['mut'] = {
  nud: function(content, loc) {
    var node = exports['let'].nud.call(this, content, loc);
    return new syntax.MutableVariableDeclaration(node.name, node.type, node.expression);
  }
};

/* istanbul ignore next */
exports['out'] = {
  nud: function(content, loc) {
    var node = exports['let'].nud.call(this, content, loc);
    return new syntax.OutVariableDeclaration(node.name, node.type, node.expression);
  }
};

/* istanbul ignore next */
exports['='] = {
  lbp: 1,
  led: function(left) {
    if (!(left instanceof syntax.Identifier) && !(left instanceof syntax.PropertyAccessExpression))
      throw new Error('Invalid left side of assigment (' + left.constructor.name + ')');

    return new syntax.AssignmentStatement(left, this.expression(1));
  }
};
