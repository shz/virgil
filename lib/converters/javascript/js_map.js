var renameMethod = function(m) {
  return function(left, args) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: left,
        property: {
          type: 'Identifier',
          name: m
        }
      },
      arguments: args
    };
  };
};

var math = function(m) {
  return function(left, args) {
    return {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        computed: false,
        object: { type: 'Identifier', name: 'Math' },
        property: { type: 'Identifier', name: m }
      },
      arguments: [left]
    }
  };
};

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

exports['list'] = {
  methodCall: {
    'remove': function(left, args) {
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
          { type: 'Literal', value: 0, raw: '0' },
          args[0]
        ]
      }
    },
    'removeRange': function(left, args) {
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
    }
  }
};

exports['str'] = {
  propertyAccess: {},
  methodCall: {
    'asInt': function(left, args) {
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseInt' },
        arguments: [
          left,
          { type: 'Literal', value: 10, raw: '10' }
        ]
      };
    },

    'asFloat': function(left, args) {
      return {
        type: 'CallExpression',
        callee: { type: 'Identifier', name: 'parseFloat' },
        arguments: [ left ]
      };
    },
    'at': renameMethod('charAt'),
    'upper': renameMethod('toUpperCase'),
    'lower': renameMethod('toLowerCase'),
    'trim': function(left, args) {
      return regexReplace(regexReplace(left, /^\s*/, ''), /\s*$/, '');
    },
    'trimStart': function(left, args) {
      return regexReplace(left, /^\s*/, '');
    },
    'trimEnd': function(left, args) {
      return regexReplace(left, /\s*$/, '');
    },
  }
};

exports['int'] = {
  propertyAccess: {},
  methodCall: {
    // asFloat is a no-op seeing as all numbers in JS are floats anyway...
    'asFloat': function(left, args) {
      return left;
    },
    'asStr': renameMethod('toString'),
    'abs': math('abs')
  }
};

exports['float'] = {
  propertyAccess: {},
  methodCall: {
    'abs': math('abs'),
    'floor': math('floor'),
    'ceil': math('ceil'),
    'sin': math('sin'),
    'cos': math('cos'),
    'tan': math('tan'),
    'asin': math('asin'),
    'acos': math('acos'),
    'atan': math('atan'),
    'round': math('round'),
    'format': renameMethod('toFixed')
  }
};
