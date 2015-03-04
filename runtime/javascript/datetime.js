module.exports = function DateTime(spec) {
  this.ts = (spec && typeof spec.ts == 'number') ? spec.ts : ((new Date() / 1000) | 0);
  this.offset = (spec && typeof spec.offset == 'number') ? spec.offset : 0;
};

var DateTime = module.exports;

module.exports.prototype.toGMT = function() {
  return new DateTime({ts: this.ts, offset: 0});
}

module.exports.prototype.toLocal = function() {
  return new DateTime({ts: this.ts, offset: new Date().getTimezoneOffset() * 60});
}

module.exports.prototype.toOffset = function(newoffset) {
  return new DateTime({ts: this.ts, offset: newoffset});
}

function canUseInternationalizationAPI() {
  var jsDate = new Date();
  return (typeof(jsDate.toLocaleDateString) == 'function') && (jsDate.toLocaleDateString('en-US') != jsDate.toLocaleDateString('de-AT'));
}


var tzOption = {timeZone: "UTC"};

/* 

Currently, any defined value for specForDate/Time means "show that particular component".
Eventually, we will support variations such as "short", "long", etc.

We have two formatters -- we deploy the one that best uses the JS environment's internationalization capabilities.
*/

function formatSophisticated (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date(this.ts + this.offset);
  if (specForDate) {
    retval = jsDate.toLocaleDateString(undefined, tzOption);  // offset has already been done via manip of the timestamp
  }
  if (specForTime) {
    retval += (retval ? " " : "") + jsDate.toLocaleTimeString(undefined, tzOption);  // offset has already been done via manip of the timestamp
  }
  return retval;
};

function zeroPad(n) {
  return ('00000'+n).slice(-2);
}

function formatFallback (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date(this.ts + this.offset);
  if (specForDate) {
    // Right now: just american style mm/dd/yyyy
    // We will want to do a better job, more sensitive to the major other locales, soon.
    retval = (jsDate.getUTCMonth()+1) + "/" + (jsDate.getUTCDate()) + "/" + (jsDate.getUTCFullYear());  // offset has already been done via manip of the timestamp
  }
  if (specForTime) {
    // Right now: just a basic hh:mm:ss in military time
    retval += (retval ? " " : "") + zeroPad(jsDate.getUTCHours()) + ':' + zeroPad(jsDate.getUTCMinutes()) + ':' + zeroPad(jsDate.getUTCSeconds());  // offset has already been done via manip of the timestamp
  }
  return retval;
};

module.exports.prototype.format = canUseInternationalizationAPI() ? formatSophisticated : formatFallback;
