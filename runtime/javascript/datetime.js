module.exports = function DateTime(spec) {
  this.ts = (spec && typeof spec.ts == 'number') ? spec.ts : +new Date();
  this.offset = (spec && typeof spec.offset == 'number') ? spec.offset : 0;
};

// module.exports.prototype.toLocal   

