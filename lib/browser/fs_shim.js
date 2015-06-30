var shims = module.exports = {};
shims.shim = function(obj) {
  for (var i in obj) if (obj.hasOwnProperty(i)) {
    if (i == 'shim') {
      continue;
    }
    shims[i] = obj[i];
  }
};
