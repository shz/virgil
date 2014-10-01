var rename = function(s) {
  return function(left, args) {
    var result = left + '->' + s;
    if (args) {
      result += '(' + args.join(',') + ')'
    }
    return result;
  }
};
var renameAndCall = function(s) {
  return function(left) {
    return left + '->' + s + '()';
  };
};

exports['list'] = {
  propertyAccess: {
    'length': renameAndCall('size')
  },
  methodCall: {
    'push': rename('push_back'),
    'empty': rename('clear'),
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
    'length': function(left, args) {
      var s = '';
      s += left + '.length()';
      return s;
    }
  },
  methodCall: {
    'asInt': function(left, args) {
      var s = '';
      s += 'atoi(' + left + '.c_str())';
      return s;
    },
    'asFloat': function(left, args) {
      var s = '';
      s += 'atof(' + left + '.c_str())';
      return s;
    },
    'at': function(left, args) {
      var s = '';
      s += '( std::string(1, ' + left + '.at('+args+')) )';
      return s;
    },
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
    },
    'round': function(left, args) {
      var s = 'std::trunc(std::round(' + left + '))';
      return s;
    },
    'abs': function(left, args) {
      var s = 'std::abs(' + left + ')';
      return s;
    },
    'cos': function(left, args) {
      var s = 'cos(' + left + ')';
      return s;
    },
    'sin': function(left, args) {
      var s = 'sin(' + left + ')';
      return s;
    }
  }
};
