var Slot = require('./slot');

var SlotList = function SlotList() {};

SlotList.prototype = {
  constructor: SlotList,

  set: function(name, value, type, immutable) {
    var slot = this[name];
    if (!slot) {
      this[name] = new Slot(
        name,
        value,
        type,
        immutable === undefined ? true : immutable
      );
      return;
    }

    this[name].assign(value);
  },
  get: function(name) {
    var slot = this[name];
    if (!slot) {
      throw new Error('Attempted to read from a nonexistant slot');
    }

    return slot.value;
  }
};

// Exported

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
