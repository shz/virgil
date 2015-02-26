var precedence = require('../precedence')
  , ast = require('../../ast')
  , types = require('../../types')
  ;

exports['identifier'] = {
  nud: function(value, loc) {
    var node = new ast.Identifier(value);
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
    if (expression.constructor == ast.DefaultLiteral) {
      if (type == types.canned['inferred'])
        throw new Error('Must specify variable\'s type when using default');
      expression.type = type;
    }

    var node = new ast.VariableDeclaration(name, type, expression, value && !!value.match(/\!$/));
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
    var mutvd = new ast.MutableVariableDeclaration(node.name, node.type,
      node.expression, value && !!value.match(/\!$/));
    mutvd.loc = node.loc;
    return mutvd;
  }
};

exports['out'] = {
  nud: function(value, loc) {
    var node = exports['let'].nud.call(this, value, loc);
    var outvd = new ast.OutVariableDeclaration(node.name, node.type,
      node.expression, value && !!value.match(/\!$/));
    outvd.loc = node.loc;
    return outvd;
  }
};

exports['='] = {
  led: function(left) {
    if (!(left instanceof ast.Identifier) && !(left instanceof ast.PropertyAccessExpression))
      throw new Error('Invalid left side of assigment (' + left.constructor.name + ')');

    return new ast.AssignmentStatement(left, this.expression(precedence['=']));
  }
};

exports['default'] = {
  nud: function(value, loc) {
    var node = new ast.DefaultLiteral();
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
