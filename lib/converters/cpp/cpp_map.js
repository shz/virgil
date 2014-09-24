exports['list'] = {
  propertyAccess: {
    'length': 'size()'
  },
  methodCall: {
    'push': 'push_back',
    'pop': function(left, args) {
      var s = '';
      s += '{ ';
      s += ' auto left = ' + left + ';'
      s += ' auto t = left->back(); left->pop_back(); t;';
      s += ' }';
      return s;
    }
  }
};
