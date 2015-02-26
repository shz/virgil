var syntax = require('../../ast')
  , types = require('../../types')
  ;

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

exports['let'] = {
  nud: function(value, loc) {
    var name = this.expect('identifier')[1];
    if (name[0].toUpperCase() == name[0]) {
      this._updateLines(this.prev);
      throw new Error('Variable names must be lowerCamelCased');
    }

    var type = types.canned['inferred'];
    if (this.peek(':')) {
      type = this.typeRef();
    }
    if (type == types.canned['void'])
      throw new Error('Type void is not a valid variable type');

    this.expect('=');

    var expression = this.expression();
    if (expression.constructor == syntax.DefaultLiteral) {
      if (type == types.canned['inferred'])
        throw new Error('Must specify variable\'s type when using default');
      expression.type = type;
    }

    var node = new syntax.VariableDeclaration(name, type, expression, value && !!value.match(/\!$/));
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

exports['mut'] = {
  nud: function(value, loc) {
    var node = exports['let'].nud.call(this, value, loc);
    var mutvd = new syntax.MutableVariableDeclaration(node.name, node.type,
      node.expression, value && !!value.match(/\!$/));
    mutvd.loc = node.loc;
    return mutvd;
  }
};

exports['out'] = {
  nud: function(value, loc) {
    var node = exports['let'].nud.call(this, value, loc);
    var outvd = new syntax.OutVariableDeclaration(node.name, node.type,
      node.expression, value && !!value.match(/\!$/));
    outvd.loc = node.loc;
    return outvd;
  }
};

exports['='] = {
  lbp: 1,
  led: function(left) {
    if (!(left instanceof syntax.Identifier) && !(left instanceof syntax.PropertyAccessExpression))
      throw new Error('Invalid left side of assigment (' + left.constructor.name + ')');

    return new syntax.AssignmentStatement(left, this.expression(1));
  }
};

exports['default'] = {
  nud: function(value, loc) {
    var node = new syntax.DefaultLiteral();
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
