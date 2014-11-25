var syntax = require('../../ast')
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

/* istanbul ignore next */
exports['true'] = {
  nud: function(value, loc) {
    return addLoc(new syntax.TrueLiteral(), loc);
  }
};

/* istanbul ignore next */
exports['false'] = {
  nud: function(value, loc) {
    return addLoc(new syntax.FalseLiteral(), loc);
  }
};


/* istanbul ignore next */
exports['int'] = {
  nud: function(value, loc) {
    return addLoc(new syntax.IntegerLiteral(value), loc);
  }
};

/* istanbul ignore next */
exports['float'] = {
  nud: function(value, loc) {
    return addLoc(new syntax.FloatLiteral(value), loc);
  }
};

/* istanbul ignore next */
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

    return addLoc(new syntax.StringLiteral(value), loc);
  }
};

/* istanbul ignore next */
exports['null'] = {
  nud: function(value, loc) {
    return addLoc(new syntax.NullLiteral(), loc);
  }
};
