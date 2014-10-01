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

    'upper': renameMethod('toUpperCase'),
    'lower': renameMethod('toLowerCase')
  }
};
