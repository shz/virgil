exports['list'] = {
  propertyAccess: {
    'length': 'size()'
  },
  methodCall: {
    'push': 'push_back',
    'empty': 'clear',
    'pop': function(left, args) {
      var s = '';
      s += '({';
      s += ' auto left = ' + left + ';'
      s += ' auto t = left->back(); left->pop_back(); t;';
      s += ' })';
      return s;
    },
    'remove': function(left, args) {
      // NOT YET USING "args"; THIS IS A HARDWIRED PROTOTYPE THAT SIMPLY DELETES THE VERY FIRST ITEM
      var s = '({';
      s += ' auto left = ' + left + ';'
      s += ' left->erase(left->begin(), left->begin()+1);'
      s += ' })';
      return s;
    },
    'removeRange': function(left, args) {
      // NOT YET USING "args"; THIS IS A HARDWIRED PROTOTYPE THAT SIMPLY DELETES THE VERY FIRST ITEM
      var s = '({';
      s += ' auto left = ' + left + ';'
      s += ' left->erase(left->begin(), left->begin()+1);'
      s += ' })';
      return s;
    }
  }
};



exports['str'] = {
  propertyAccess: {
  },
  methodCall: {
    'upper':  function(left, args) {
      var s = '';
      s += '({';
      s += '  auto left = ' + left + ';';
      s += '  std::transform(left.begin(), left.end(), left.begin(), ::toupper); ';
      s += '  left; })';
      return s;
    },
    'lower':  function(left, args) {
      var s = '';
      s += '({';
      s += '  auto left = ' + left + ';';
      s += '  std::transform(left.begin(), left.end(), left.begin(), ::tolower); ';
      s += '  left; })';
      return s;
    }
  }
};



exports['float'] = {
  propertyAccess: {
  },
  methodCall: {
    'format': function(left, args) {
      // NOT YET USING "args"; THIS IS A HARDWIRED PROTOTYPE 
      var s = '';
      s += '({';
      s += ' std::ostringstream result;'
      s += ' result << std::setprecision(2) << (' + left + '); result.str(); '
      s += ' })';
      return s;
    },
    'floor': function(left, args) {
      var s = 'std::floor(' + left + ')';
      return s;
    },
    'ceil': function(left, args) {
      var s = 'std::ceil(' + left + ')';
      return s;
    }
  }
};
