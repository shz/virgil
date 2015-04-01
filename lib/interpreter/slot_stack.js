var Slot = require('./slot');

var SlotList = function SlotList() {};

SlotList.prototype = {
  constructor: SlotList,

  set: function(name, value, immutable, type) {
    var slot = this[name];
    if (!slot) {
      this[name] = new Slot(
        name,
        value,
        immutable === undefined ? true : immutable,
        type
      );
      return;
    }

    if (slot.immutable) {
      throw new Error('Attempted to assign to an immutable slot');
    }
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

  push: function() {
    this.cur = new SlotList();
    this.list.push(this.cur);
    return this.cur;
  },
  pop: function() {
    this.list.pop();
    this.cur = this.list[this.list.length - 1];
  },
  get: function(name) {
    var cur = null;
    for (var i=this.list.length - 1; i>=0; i--) {
      cur = this.list[i];
      if (cur.hasOwnProperty(name)) {
        break;
      }
    }
    if (!cur) {
      throw new Error('Slot ' + name + ' does not exist');
    }

    return cur.get(name);
  },
  set: function() {
    // THIS HAS A BUG:
    // If the name is defined in a scope before cur, the value should
    // be updated there.
    this.cur.set.apply(this.cur, arguments);
  }
};
