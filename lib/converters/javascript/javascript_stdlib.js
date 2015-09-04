// Regex util
var regexReplace = function(left, re, val) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: left,
      property: { type: 'Identifier', name: 'replace' }
    },
    arguments: [{
      type: 'Literal',
      value: re,
      regex: { pattern: re.source, flags: '' }
    }, {
      type: 'Literal',
      value: val
    }]
  };
};

// Return the left unmodified
var nop = function() {
  return function(left, args, isProperty, name) {
    return left;
  }
};

// Pass through behavior, basically
var normal = function() {
  return function(left, args, isProperty, name) {
    var base = {
      type: 'MemberExpression',
      computed: false,
      object: left,
      property: { type: 'Identifier', name: name }
    };
    if (isProperty) {
      return base;
    } else {
      return {
        type: 'CallExpression',
        callee: base,
        arguments: args
      };
    }
  };
};

// Call the specified function from the math library on left
var math = function() {
  return function(left, args, isProperty, name) {
    if (isProperty) {
      left.throw('Incorrect use of Math in Javascript stdlib');
    }

    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: name }
      },
      arguments: [left]
    };
  };
};

// Call a method on the left
var method = function(name, baseArgs) {
  return function(left, args, isProperty, name) {
    var useArgs = (baseArgs || []).map(function(a) {
      if (typeof a == 'number') {
        return args[a];
      } else {
        return a;
      }
    });

    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: left,
        property: { type: 'Identifier', name: name }
      },
      arguments: useArgs
    };
  };
};

// Specific stuff
var floatFormat = function(left, args, isProperty, name) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: left,
      property: { type: 'Identifier', name: 'toLocaleString' }
    },
    arguments: [{ type: 'Identifier', name: 'undefined' }, {
      type: 'ObjectExpression',
      properties: [
        { type: 'Property'
        , key: { type: 'Identifier', name: 'style' }
        , value: { type: 'Literal', value: 'decimal', raw: '\'decimal\'' }},
        { type: 'Property'
        , key: { type: 'Identifier', name: 'maximumFractionDigits' }
        , value: args[0] }
      ]
    }]
  };
};
var listEmpty = function(left, args, isProperty, name) {
  return {
    type: 'AssignmentExpression',
    operator: '=',
    left: {
      type: 'MemberExpression',
      computed: false,
      object: left,
      property: { type: 'Identifier', name: 'length' }
    },
    right: { type: 'Literal', value: 0, raw: '0' }
  };
};
var listRemove = function(left, args, isProperty, name) {
  return {
    type: 'MemberExpression',
    computed: true,
    property: { type: 'Literal', value: 0, raw: '0' },
    object: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: left,
        property: {
          type: 'Identifier',
          name: 'splice'
        }
      },
      arguments: [
        args[0],
        { type: 'Literal', value: 1, raw: '1' }
      ]
    }
  };
};
var listRemoveRange = function(left, args, isProperty, name) {
  return { type: 'Identifier', name: 'TODO' };
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: left,
      property: {
        type: 'Identifier',
        name: 'splice'
      }
    },
    arguments: [
      args[0], args[1]
    ]
  };
};
var strLog = function(left, args, isProperty, name) {
  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      computed: false,
      object: 'console',
      property: { type: 'Identifier', name: 'log' }
    },
    arguments: [left]
  };
};
var strAsInt = function(left, args, isProperty, name) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'parseInt' },
    arguments: [
      left,
      { type: 'Literal', value: 10, raw: '10' }
    ]
  };
};
var strAsFloat = function(left, args, isProperty, name) {
  return {
    type: 'CallExpression',
    callee: { type: 'Identifier', name: 'parseFloat' },
    arguments: [ left ]
  };
};
var strTrim = function(left, args, isProperty, name) {
  regexReplace(regexReplace(left, /^\s*/, ''), /\s*$/, '');
};

module.exports = {
  'bool': {},
  'func': {},
  'method': {},
  'datetime': {
    ts: normal(),
    offset: normal(),
    toLocal: normal(),
    toOffset: normal(),
    toGMT: normal(),
    format: normal()
  },
  'float': {
    format: floatFormat,
    floor: math(),
    ceil: math(),
    round: math(),
    abs: math(),
    cos: math(),
    sin: math(),
    tan: math(),
    acos: math(),
    asin: math(),
    atan: math(),
    sqrt: math()
  },
  'int': {
    asFloat: nop(),
    asStr: method('toString'),
    abs: math()
  },
  'list': {
    length: normal(),
    empty: listEmpty,
    remove: listRemove,
    removeRange: listRemoveRange,
    push: normal(),
    pop: normal()
  },
  'str': {
    length: normal(),
    trim: strTrim,
    substr: normal(),
    upper: method('toUpperCase'),
    lower: method('toLowerCase'),
    at: method('getCharAt', [0]),
    log: strLog,
    asInt: strAsInt,
    asFloat: strAsFloat
  }
};
