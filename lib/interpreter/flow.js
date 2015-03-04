exports.RETURN = function(val) {
  return { type: 'return', value: val };
};
exports.BREAK = function() { return { type: 'break' } };
exports.CONTINUE = function() { return { type: 'continue' } };
