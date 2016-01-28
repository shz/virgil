var Slot = require('./slot');

var SlotList = module.exports = function SlotList() {};

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
