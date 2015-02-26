var ast = require('../../ast')
  ;

var addLoc = function(node, loc) {
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
};

exports['true'] = {
  nud: function(value, loc) {
    return addLoc(new ast.TrueLiteral(), loc);
  }
};

exports['false'] = {
  nud: function(value, loc) {
    return addLoc(new ast.FalseLiteral(), loc);
  }
};

exports['int'] = {
  nud: function(value, loc) {
    return addLoc(new ast.IntegerLiteral(value), loc);
  }
};

exports['float'] = {
  nud: function(value, loc) {
    return addLoc(new ast.FloatLiteral(value), loc);
  }
};

exports['string'] = {
  nud: function(value, loc) {
    // Strip leading " sequences and unescape
    value = value.replace(/^"+/, '').replace(/"$/, '');
    value = value.replace(/\\(.)/g, function(all, t) {
      switch (t) {
        case 't':
          return '\t';
        case 'r':
          return '\r';
        case 'n':
          return '\n';
        case '\\':
          return '\\';
        case '"':
          return '"';
        default:
          throw new Error('Unrecognized escape sequence \\' + t);
      }
    });

    return addLoc(new ast.StringLiteral(value), loc);
  }
};

exports['null'] = {
  nud: function(value, loc) {
    return addLoc(new ast.NullLiteral(), loc);
  }
};
