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
    'lower': renameMethod('toLowerCase')
  }
};

exports['int'] = {
  propertyAccess: {},
  methodCall: {
    // asFloat is a no-op seeing as all numbers in JS are floats anyway...
    'asFloat': function(left, args) {
      return left;
    },
    'asStr': function(left, args) {
      return {
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: left,
          property: {
            type: 'Identifier',
            name: 'toString'
          }
        },
        arguments: []
      };
    },
    'abs': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' }
        }
      };
    }
  }
};

exports['float'] = {
  propertyAccess: {},
  methodCall: {
    'abs': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'abs' }
        }
      };
    },
    'floor': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'floor' }
        }
      };
    },
    'ceil': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'ceil' }
        }
      };
    },
    'sin': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'sin' }
        }
      };
    },
    'cos': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'cos' }
        }
      };
    },
    'round': function(left, args) {
      return {
        type: 'CallExpression',
        arguments: [left],
        callee: {
          type: 'MemberExpression',
          computed: false,
          object: { type: 'Identifier', name: 'Math' },
          property: { type: 'Identifier', name: 'round' }
        }
      };
    },

    // TODO - This is super nasty
    'format': require('./function_format')
  }
};
