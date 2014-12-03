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
    'format': function(left, args) {
      return {
        "type": "CallExpression",
        "callee": {
          "type": "FunctionExpression",
          "id": null,
          "params": [
            {
              "type": "Identifier",
              "name": "raw"
            },
            {
              "type": "Identifier",
              "name": "i"
            }
          ],
          "defaults": [],
          "body": {
            "type": "BlockStatement",
            "body": [
              {
                "type": "VariableDeclaration",
                "declarations": [
                  {
                    "type": "VariableDeclarator",
                    "id": {
                      "type": "Identifier",
                      "name": "raised"
                    },
                    "init": {
                      "type": "CallExpression",
                      "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                          "type": "CallExpression",
                          "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                              "type": "Identifier",
                              "name": "Math"
                            },
                            "property": {
                              "type": "Identifier",
                              "name": "round"
                            }
                          },
                          "arguments": [
                            {
                              "type": "BinaryExpression",
                              "operator": "*",
                              "left": {
                                "type": "Identifier",
                                "name": "raw"
                              },
                              "right": {
                                "type": "CallExpression",
                                "callee": {
                                  "type": "MemberExpression",
                                  "computed": false,
                                  "object": {
                                    "type": "Identifier",
                                    "name": "Math"
                                  },
                                  "property": {
                                    "type": "Identifier",
                                    "name": "pow"
                                  }
                                },
                                "arguments": [
                                  {
                                    "type": "Literal",
                                    "value": 10,
                                    "raw": "10"
                                  },
                                  {
                                    "type": "Identifier",
                                    "name": "i"
                                  }
                                ]
                              }
                            }
                          ]
                        },
                        "property": {
                          "type": "Identifier",
                          "name": "toString"
                        }
                      },
                      "arguments": []
                    }
                  }
                ],
                "kind": "var"
              },
              {
                "type": "VariableDeclaration",
                "declarations": [
                  {
                    "type": "VariableDeclarator",
                    "id": {
                      "type": "Identifier",
                      "name": "len"
                    },
                    "init": {
                      "type": "MemberExpression",
                      "computed": false,
                      "object": {
                        "type": "Identifier",
                        "name": "raised"
                      },
                      "property": {
                        "type": "Identifier",
                        "name": "length"
                      }
                    }
                  }
                ],
                "kind": "var"
              },
              {
                "type": "VariableDeclaration",
                "declarations": [
                  {
                    "type": "VariableDeclarator",
                    "id": {
                      "type": "Identifier",
                      "name": "numLeadingZerosNeeded"
                    },
                    "init": {
                      "type": "BinaryExpression",
                      "operator": "-",
                      "left": {
                        "type": "Identifier",
                        "name": "i"
                      },
                      "right": {
                        "type": "Identifier",
                        "name": "len"
                      }
                    }
                  }
                ],
                "kind": "var"
              },
              {
                "type": "WhileStatement",
                "test": {
                  "type": "BinaryExpression",
                  "operator": ">",
                  "left": {
                    "type": "Identifier",
                    "name": "numLeadingZerosNeeded"
                  },
                  "right": {
                    "type": "Literal",
                    "value": 0,
                    "raw": "0"
                  }
                },
                "body": {
                  "type": "BlockStatement",
                  "body": [
                    {
                      "type": "ExpressionStatement",
                      "expression": {
                        "type": "AssignmentExpression",
                        "operator": "=",
                        "left": {
                          "type": "Identifier",
                          "name": "raised"
                        },
                        "right": {
                          "type": "BinaryExpression",
                          "operator": "+",
                          "left": {
                            "type": "Literal",
                            "value": "0",
                            "raw": "\"0\""
                          },
                          "right": {
                            "type": "CallExpression",
                            "callee": {
                              "type": "Identifier",
                              "name": "String"
                            },
                            "arguments": [
                              {
                                "type": "Identifier",
                                "name": "raised"
                              }
                            ]
                          }
                        }
                      }
                    },
                    {
                      "type": "ExpressionStatement",
                      "expression": {
                        "type": "UpdateExpression",
                        "operator": "--",
                        "argument": {
                          "type": "Identifier",
                          "name": "numLeadingZerosNeeded"
                        },
                        "prefix": false
                      }
                    }
                  ]
                }
              },
              {
                "type": "ExpressionStatement",
                "expression": {
                  "type": "AssignmentExpression",
                  "operator": "=",
                  "left": {
                    "type": "Identifier",
                    "name": "len"
                  },
                  "right": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "Identifier",
                      "name": "raised"
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "length"
                    }
                  }
                }
              },
              {
                "type": "VariableDeclaration",
                "declarations": [
                  {
                    "type": "VariableDeclarator",
                    "id": {
                      "type": "Identifier",
                      "name": "rslt"
                    },
                    "init": {
                      "type": "CallExpression",
                      "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                          "type": "BinaryExpression",
                          "operator": "+",
                          "left": {
                            "type": "BinaryExpression",
                            "operator": "+",
                            "left": {
                              "type": "CallExpression",
                              "callee": {
                                "type": "MemberExpression",
                                "computed": false,
                                "object": {
                                  "type": "Identifier",
                                  "name": "raised"
                                },
                                "property": {
                                  "type": "Identifier",
                                  "name": "substr"
                                }
                              },
                              "arguments": [
                                {
                                  "type": "Literal",
                                  "value": 0,
                                  "raw": "0"
                                },
                                {
                                  "type": "BinaryExpression",
                                  "operator": "-",
                                  "left": {
                                    "type": "Identifier",
                                    "name": "len"
                                  },
                                  "right": {
                                    "type": "Identifier",
                                    "name": "i"
                                  }
                                }
                              ]
                            },
                            "right": {
                              "type": "Literal",
                              "value": ".",
                              "raw": "'.'"
                            }
                          },
                          "right": {
                            "type": "CallExpression",
                            "callee": {
                              "type": "MemberExpression",
                              "computed": false,
                              "object": {
                                "type": "Identifier",
                                "name": "raised"
                              },
                              "property": {
                                "type": "Identifier",
                                "name": "substr"
                              }
                            },
                            "arguments": [
                              {
                                "type": "BinaryExpression",
                                "operator": "-",
                                "left": {
                                  "type": "Identifier",
                                  "name": "len"
                                },
                                "right": {
                                  "type": "Identifier",
                                  "name": "i"
                                }
                              }
                            ]
                          }
                        },
                        "property": {
                          "type": "Identifier",
                          "name": "replace"
                        }
                      },
                      "arguments": [
                        {
                          "type": "Literal",
                          "value": "/\\.$/",
                          "raw": "/\\.$/"
                        },
                        {
                          "type": "Literal",
                          "value": "",
                          "raw": "''"
                        }
                      ]
                    }
                  }
                ],
                "kind": "var"
              },
              {
                "type": "ReturnStatement",
                "argument": {
                  "type": "CallExpression",
                  "callee": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                      "type": "CallExpression",
                      "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                          "type": "Identifier",
                          "name": "rslt"
                        },
                        "property": {
                          "type": "Identifier",
                          "name": "replace"
                        }
                      },
                      "arguments": [
                        {
                          "type": "Literal",
                          "value": "/^\\./",
                          "raw": "/^\\./"
                        },
                        {
                          "type": "Literal",
                          "value": "0.",
                          "raw": "'0.'"
                        }
                      ]
                    },
                    "property": {
                      "type": "Identifier",
                      "name": "replace"
                    }
                  },
                  "arguments": [
                    {
                      "type": "Literal",
                      "value": "/^\\-\\./",
                      "raw": "/^\\-\\./"
                    },
                    {
                      "type": "Literal",
                      "value": "-0.",
                      "raw": "'-0.'"
                    }
                  ]
                }
              }
            ]
          },
          "rest": null,
          "generator": false,
          "expression": false
        },
        'arguments': [left, args[0]]
      };
    }
  }
};
