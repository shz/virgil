var map = { 'str': 'String'
          , 'float': 'Double'
          , 'int': 'Int'
          , 'bool': 'Bool'
          , 'void': 'Void'
          }

exports.type = function(tr) {
  if (tr.builtin) {
    if (tr.name == 'list') {
      return '[' + this.type(tr.generics[0]) + ']';
    } else if (!map[tr.name]) {
      throw new Error('Unknown type conversion from ' + tr.toString());
    }
    return map[tr.name];
  } else {
    return tr.toString();
  }
};
