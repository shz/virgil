// TODO: This is super nasty
// The Javascript that generated this parse tree is as follows (with constants in place of the left,args variables).
// 
//(function(raw,i){
//  var raised = (Math.round( raw * Math.pow(10,i))).toString();
//  var len = raised.length;
//  var rslt = (raised.substr(0,(len-i)) + '.' + raised.substr(len-i)).replace(/\.$/,'');
//  return rslt.replace(/^\./,'0.').replace(/^\-\./,'-0.');
//})(-0.1415923,1)


module.exports = function(left, args) {
    return {
        'type': 'CallExpression',
        'callee': {
            'type': 'FunctionExpression',
            'id': null,
            'params': [
		{
		    'type': 'Identifier',
		    'name': 'raw'
		},
		{
		    'type': 'Identifier',
		    'name': 'i'
		}
            ],
            'defaults': [],
            'body': {
		'type': 'BlockStatement',
		'body': [
		    {
			'type': 'VariableDeclaration',
			'declarations': [
			    {
				'type': 'VariableDeclarator',
				'id': {
				    'type': 'Identifier',
				    'name': 'raised'
				},
				'init': {
				    'type': 'CallExpression',
				    'callee': {
					'type': 'MemberExpression',
					'computed': false,
					'object': {
					    'type': 'CallExpression',
					    'callee': {
						'type': 'MemberExpression',
						'computed': false,
						'object': {
						    'type': 'Identifier',
						    'name': 'Math'
						},
						'property': {
						    'type': 'Identifier',
						    'name': 'round'
						}
					    },
					    'arguments': [
						{
						    'type': 'BinaryExpression',
						    'operator': '*',
						    'left': {
							'type': 'Identifier',
							'name': 'raw'
						    },
						    'right': {
							'type': 'CallExpression',
							'callee': {
							    'type': 'MemberExpression',
							    'computed': false,
							    'object': {
								'type': 'Identifier',
								'name': 'Math'
							    },
							    'property': {
								'type': 'Identifier',
								'name': 'pow'
							    }
							},
							'arguments': [
							    {
								'type': 'Literal',
								'value': 10,
								'raw': '10'
							    },
							    {
								'type': 'Identifier',
								'name': 'i'
							    }
							]
						    }
						}
					    ]
					},
					'property': {
					    'type': 'Identifier',
					    'name': 'toString'
					}
				    },
				    'arguments': []
				}
			    }
			],
			'kind': 'var'
		    },
		    {
			'type': 'VariableDeclaration',
			'declarations': [
			    {
				'type': 'VariableDeclarator',
				'id': {
				    'type': 'Identifier',
				    'name': 'len'
				},
				'init': {
				    'type': 'MemberExpression',
				    'computed': false,
				    'object': {
					'type': 'Identifier',
					'name': 'raised'
				    },
				    'property': {
					'type': 'Identifier',
					'name': 'length'
				    }
				}
			    }
			],
			'kind': 'var'
		    },
		    {
			'type': 'VariableDeclaration',
			'declarations': [
			    {
				'type': 'VariableDeclarator',
				'id': {
				    'type': 'Identifier',
				    'name': 'numLeadingZerosNeeded'
				},
				'init': {
				    'type': 'BinaryExpression',
				    'operator': '-',
				    'left': {
					'type': 'Identifier',
					'name': 'i'
				    },
				    'right': {
					'type': 'Identifier',
					'name': 'len'
				    }
				}
			    }
			],
			'kind': 'var'
		    },
		    {
			'type': 'WhileStatement',
			'test': {
			    'type': 'BinaryExpression',
			    'operator': '>',
			    'left': {
				'type': 'Identifier',
				'name': 'numLeadingZerosNeeded'
			    },
			    'right': {
				'type': 'Literal',
				'value': 0,
				'raw': '0'
			    }
			},
			'body': {
			    'type': 'BlockStatement',
			    'body': [
				{
				    'type': 'ExpressionStatement',
				    'expression': {
					'type': 'AssignmentExpression',
					'operator': '=',
					'left': {
					    'type': 'Identifier',
					    'name': 'raised'
					},
					'right': {
					    'type': 'BinaryExpression',
					    'operator': '+',
					    'left': {
						'type': 'Literal',
						'value': '0',
						'raw': '\'0\''
					    },
					    'right': {
						'type': 'CallExpression',
						'callee': {
						    'type': 'Identifier',
						    'name': 'String'
						},
						'arguments': [
						    {
							'type': 'Identifier',
							'name': 'raised'
						    }
						]
					    }
					}
				    }
				},
				{
				    'type': 'ExpressionStatement',
				    'expression': {
					'type': 'UpdateExpression',
					'operator': '--',
					'argument': {
					    'type': 'Identifier',
					    'name': 'numLeadingZerosNeeded'
					},
					'prefix': false
				    }
				}
			    ]
			}
		    },
		    {
			'type': 'ExpressionStatement',
			'expression': {
			    'type': 'AssignmentExpression',
			    'operator': '=',
			    'left': {
				'type': 'Identifier',
				'name': 'len'
			    },
			    'right': {
				'type': 'MemberExpression',
				'computed': false,
				'object': {
				    'type': 'Identifier',
				    'name': 'raised'
				},
				'property': {
				    'type': 'Identifier',
				    'name': 'length'
				}
			    }
			}
		    },
		    {
			'type': 'VariableDeclaration',
			'declarations': [
			    {
				'type': 'VariableDeclarator',
				'id': {
				    'type': 'Identifier',
				    'name': 'rslt'
				},
				'init': {
				    'type': 'CallExpression',
				    'callee': {
					'type': 'MemberExpression',
					'computed': false,
					'object': {
					    'type': 'BinaryExpression',
					    'operator': '+',
					    'left': {
						'type': 'BinaryExpression',
						'operator': '+',
						'left': {
						    'type': 'CallExpression',
						    'callee': {
							'type': 'MemberExpression',
							'computed': false,
							'object': {
							    'type': 'Identifier',
							    'name': 'raised'
							},
							'property': {
							    'type': 'Identifier',
							    'name': 'substr'
							}
						    },
						    'arguments': [
							{
							    'type': 'Literal',
							    'value': 0,
							    'raw': '0'
							},
							{
							    'type': 'BinaryExpression',
							    'operator': '-',
							    'left': {
								'type': 'Identifier',
								'name': 'len'
							    },
							    'right': {
								'type': 'Identifier',
								'name': 'i'
							    }
							}
						    ]
						},
						'right': {
						    'type': 'Literal',
						    'value': '.',
						    'raw': '\'.\''
						}
					    },
					    'right': {
						'type': 'CallExpression',
						'callee': {
						    'type': 'MemberExpression',
						    'computed': false,
						    'object': {
							'type': 'Identifier',
							'name': 'raised'
						    },
						    'property': {
							'type': 'Identifier',
							'name': 'substr'
						    }
						},
						'arguments': [
						    {
							'type': 'BinaryExpression',
							'operator': '-',
							'left': {
							    'type': 'Identifier',
							    'name': 'len'
							},
							'right': {
							    'type': 'Identifier',
							    'name': 'i'
							}
						    }
						]
					    }
					},
					'property': {
					    'type': 'Identifier',
					    'name': 'replace'
					}
				    },
				    'arguments': [
					{
					    'type': 'Literal',
					    'value': '/\\.$/',
					    'raw': '/\\.$/'
					},
					{
					    'type': 'Literal',
					    'value': '',
					    'raw': '\'\''
					}
				    ]
				}
			    }
			],
			'kind': 'var'
		    },
		    {
			'type': 'ReturnStatement',
			'argument': {
			    'type': 'CallExpression',
			    'callee': {
				'type': 'MemberExpression',
				'computed': false,
				'object': {
				    'type': 'CallExpression',
				    'callee': {
					'type': 'MemberExpression',
					'computed': false,
					'object': {
					    'type': 'Identifier',
					    'name': 'rslt'
					},
					'property': {
					    'type': 'Identifier',
					    'name': 'replace'
					}
				    },
				    'arguments': [
					{
					    'type': 'Literal',
					    'value': /^\./,
					    'raw': '/^\\./'
					},
					{
					    'type': 'Literal',
					    'value': '0.',
					    'raw': '0.'
					}
				    ]
				},
				'property': {
				    'type': 'Identifier',
				    'name': 'replace'
				}
			    },
			    'arguments': [
				{
				    'type': 'Literal',
				    'value': /^\-\./,
				    'raw': '/^\\-\\./'
				},
				{
				    'type': 'Literal',
				    'value': '-0.',
				    'raw': '-0.'
				}
			    ]
			}
		    }
		]
            },
            'rest': null,
            'generator': false,
            'expression': false
        },
        'arguments': [left, args[0]]
    };
};