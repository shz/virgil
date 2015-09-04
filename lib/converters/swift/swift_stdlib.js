var passthrough = function(left, args, isProperty, name) {
  return null;
};
var rename = function(newName) {
  if (!newName) {
    throw new Error('Must supply the new name');
  }

  return function(left, args, isProperty, name) {
    if (isProperty) {
      return left + '.' + newName;
    } else {
      return left + '.' + newName + '(' + args.join(', ') + ')';
    }
  };
};
var LEFT = {}; // placeholder
var call = function(functionName, functionArgs) {
  functionArgs = functionArgs || [LEFT];

  return function(left, args, isProperty, name) {
    var useArgs = functionArgs.map(function(v) {
      var k = null;
      if (typeof v == 'object') {
        k = Object.keys(v)[0];
        v = v[k];
      }
      if (v == LEFT) {
        v = left;
      }

      if (k) {
        return k + ': ' + v;
      } else {
        return v;
      }
    });

    return functionName + '(' + useArgs.join(', ') + ')';
  };
};

var template = function(t) {
  return function(left, args, isProperty, name) {
    return t.replace(/\$LEFT/g, left)
            .replace(/\$1/g, args[0])
            .replace(/\$2/g, args[0])
            ;
  };
};

var TODO = function() {
  return function(left, args, isProperty, name) {
    return 'TODO';
  };
};

module.exports = {
  'bool': {},
  'datetime': {
    ts: TODO(),
    offset: TODO(),
    toLocal: TODO(),
    toOffset: TODO(),
    toGMT: TODO(),
    format: TODO()
  },
  'float': {
    format: template('({(n) -> String in let f = NSNumberFormatter(); f.maximumFractionDigits = $1; f.numberStyle = .DecimalStyle; return f.stringFromNumber(n)!; }($LEFT))'),
    floor: call('floor'),
    ceil: call('ceil'),
    round: template('Int(round($LEFT))'),
    abs: call('abs'),
    cos: call('cos'),
    sin: call('sin'),
    tan: call('tan'),
    acos: call('acos'),
    asin: call('asin'),
    atan: call('atan'),
    sqrt: call('sqrt')
  },
  'func': {},
  'int': {
    'asFloat': call('Float'),
    'asStr': call('String'),
    'abs': call('abs')
  },
  'list': {
    'length': rename('count'),
    'empty': rename('removeAll'),
    'remove': rename('removeAtIndex'),
    'removeRange': template('$LEFT.removeRange($1..<$2)'),
    'push': rename('append'),
    'pop': rename('removeLast')
  },
  'method': {},
  'str': {
    'length': call('count'),
    'trim': template('$LEFT.stringByTrimmingCharactersInSet(NSCharacterSet.whitespaceAndNewlineCharacterSet())'),
    'substr': template('{(s: String, i: Int, l: Int) in s[advance(s.startIndex, i) ..< advance(s.startIndex, i + l)]}($LEFT, $1, $2)'),
    'upper': template('$LEFT.uppercaseString'),
    'lower': template('$LEFT.lowercaseString'),
    'at': template('{(s: String, i: Int) in s[advance(s.startIndex, i) ..< advance(s.startIndex, i + 1)]}($LEFT, $1)'),
    'asInt': template('$LEFT.toInt()!'),
    'asFloat': template('NSNumberFormatter().numberFromString($LEFT)!.doubleValue'),
    'log': call('println')
  }
};


