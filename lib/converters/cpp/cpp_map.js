var ast = require('../../ast')
  , util = require('./util')
  ;

var op = function(raw) {
  var op = '->';
  if (raw.constructor == ast.Identifier && raw.def && raw.def.isArgument)
    op = '.';
  return op;
};

var swapOps = function(s, raw) {
  return s.replace(/\-\>/g, op(raw));
};

var rename = function(s) {
  return function(left, args, raw) {
    if (raw == undefined)
      raw = args;
    var result = left + op(raw) + s;
    if (args) {
      result += '(' + args.join(',') + ')'
    }
    return result;
  }
};
var renameAndCall = function(s) {
  return function(left, args, raw) {
    if (raw == undefined)
      raw = args;
    return left + op(raw) + s + '()';
  };
};

exports['list'] = {
  propertyAccess: {
    'length': renameAndCall('size')
  },
  methodCall: {
    'push': rename('push_back'),
    'empty': rename('clear'),
    'pop': function(left, args, raw) {
      var s = '';
      s += ' auto left = ' + left + ';'
      s += ' auto t = left->back(); left->pop_back();';
      return util.expressionize(swapOps(s, raw), 't');
    },
    'remove': function(left, args, raw) {
      s += ' auto left = ' + left + ';'
      s += ' auto i = ' + args[0] + ';'
      s += ' auto t = left->erase(left->begin() + i, left->begin() + i + 1);'
      return util.expressionize(swapOps(s, raw), t);
    },
    'removeRange': function(left, args, raw) {
      s += ' auto left = ' + left + ';'
      s += ' auto start = ' + args[0] + ';'
      s += ' auto end = ' + args[1] + ';'
      s += ' auto toReturn = new std::vector<std::remove_reference<decltype(left->at(0))>::type>(left->begin() + start, left->begin() + end);'
      s += ' left->erase(left->begin() + start, left->begin() + end);'
      s += ' toReturn;'
      return util.expressionize(swapOps(s, raw), toReturn);
    }
  }
};



exports['str'] = {
  propertyAccess: {
    'length': function(left, args, raw) {
      var s = '';
      s += left + '.length()';
      return s;
    }
  },
  methodCall: {
    'asInt': function(left, args, raw) {
      var s = '';
      s += 'atoi(' + left + '.c_str())';
      return s;
    },
    'asFloat': function(left, args, raw) {
      var s = '';
      s += 'atof(' + left + '.c_str())';
      return s;
    },
    'at': function(left, args, raw) {
      var s = '';
      s += '(std::string(1, ' + left + '.at('+args+')))';
      return s;
    },
    'upper':  function(left, args, raw) {
      var s = '';
      s += '  auto t = ' + left + ';';
      s += '  std::transform(t.begin(), t.end(), t.begin(), ::toupper); ';
      return util.expressionize(s, 't');
    },
    'lower':  function(left, args, raw) {
      var s = '';
      s += '  auto t = ' + left + ';';
      s += '  std::transform(t.begin(), t.end(), t.begin(), ::tolower); ';
      return util.expressionize(s, 't');
    }
  }
};



exports['float'] = {
  propertyAccess: {
  },
  methodCall: {
    'format': function(left, args, raw) {
      var s = '';
      s += ' std::ostringstream result;'
      s += ' result << std::setprecision(' + args[0] + ') << std::fixed << (' + left + '); return result.str();'
      return util.expressionize(s);
    },
    'floor': function(left, args, raw) {
      var s = 'std::floor(' + left + ')';
      return s;
    },
    'ceil': function(left, args, raw) {
      var s = 'std::ceil(' + left + ')';
      return s;
    },
    'round': function(left, args, raw) {
      var s = 'std::trunc(std::round(' + left + '))';
      return s;
    },
    'abs': function(left, args, raw) {
      var s = 'std::abs(' + left + ')';
      return s;
    },
    'cos': function(left, args, raw) {
      var s = 'cos(' + left + ')';
      return s;
    },
    'sin': function(left, args, raw) {
      var s = 'sin(' + left + ')';
      return s;
    }
  }
};

exports['int'] = {
  propertyAccess: {},
  methodCall: {
    'asFloat': function(left, args, raw) {
      return 'static_cast<float>(' + left + ')';
    }
  }
};
