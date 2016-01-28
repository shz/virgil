var SlotList = require('./slot_list');

var SlotStack = module.exports = function SlotStack(prev) {
  this.mine = new SlotList();
  this.prev = prev; // parent SlotStack
};

SlotStack.prototype = {
  constructor: SlotStack,

  _find: function(name) {
    if (this.mine.hasOwnProperty(name)) {
      return this.mine;
    } else if (this.prev) {
      return this.prev._find(name);
    } else {
      return null;
    }
  },

  push: function() {
    return new SlotStack(this);
  },
  pop: function() {
    return this.prev;
  },
  find: function(name) {
    return this._find(name)[name];
  },
  get: function(name) {
    var sl = this._find(name);
    if (!sl) {
      throw new Error('Slot ' + name + ' does not exist');
    }

    return sl.get(name);
  },
  set: function(name, value, type, immutable) {
    var sl = this._find(name) || this.mine;
    sl.set.apply(sl, arguments);
  },
  create: function(name, value, type, immutable) {
    this.mine.set.apply(this.mine, arguments);
  }
};
