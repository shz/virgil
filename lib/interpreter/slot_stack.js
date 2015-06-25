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

var SlotStack = module.exports = function SlotStack() {
  this.cur = new SlotList();
  this.list = [this.cur];
};

SlotStack.prototype = {
  constructor: SlotStack,

  _find: function(name) {
    var cur = null;
    for (var i=this.list.length - 1; i>=0; i--) {
      cur = this.list[i];
      if (cur.hasOwnProperty(name)) {
        break;
      }
    }

    return cur;
  },

  push: function() {
    this.cur = new SlotList();
    this.list.push(this.cur);
    return this.cur;
  },
  pop: function() {
    this.list.pop();
    this.cur = this.list[this.list.length - 1];
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
    var sl = this._find(name) || this.cur;
    sl.set.apply(sl, arguments);
    this.cur.set.apply(this.cur, arguments);
  },
  create: function(name, value, type, immutable) {
    this.cur.set.apply(this.cur, arguments);
  }
};
