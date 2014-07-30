var syntax = require('../../ast')
  ;

exports['int'] = {
  nud: function(value) {
    return new syntax.IntegerLiteral(value);
  }
};

exports['float'] = {
  nud: function(value) {
    return new syntax.FloatLiteral(value);
  }
};

exports['string'] = {
  nud: function(value) {
    // Strip leading " sequences and unescape
    value = value.replace(/^"+/, '').replace(/"+$/, '');
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

    return new syntax.StringLiteral(value);
  }
}
