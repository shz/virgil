var TypeRef = require('./typeref')
  ;

module.exports = { 'inferred': new TypeRef('inferred')
                 , 'bool': new TypeRef('bool')
                 , 'int': new TypeRef('int')
                 , 'str': new TypeRef('str')
                 , 'float': new TypeRef('float')
                 , 'null': new TypeRef('null')
                 , 'void': new TypeRef('void')
                 , 'datetime': new TypeRef('datetime')
                 };
