var DateTime = function DateTime(spec) {
  this.ts = (spec && typeof spec.ts == 'number') ? spec.ts : ((Date.now()/1000)|0);
  this.offset = (spec && typeof spec.offset == 'number') ? (spec.offset) : 0;
};

DateTime.prototype.toGMT = function() {
  return new DateTime({ts: this.ts, offset: 0});
}

DateTime.prototype.toLocal = function() {
  return new DateTime({ts: this.ts, offset: new Date().getTimezoneOffset() * 60});
}

DateTime.prototype.toOffset = function(newoffset) {
  return new DateTime({ts: this.ts, offset: newoffset});
}

// Intentionally "exported" to allow applications and *most importantly:* test utilities
// to vary their behavior if necessary.
DateTime.prototype.canUseInternationalizationAPI = function() {
  var jsDate = new Date();
  return (typeof(jsDate.toLocaleDateString) == 'function') && (jsDate.toLocaleDateString('en-US') != jsDate.toLocaleDateString('de-AT'));
};

// On safari, the toLocaleString returns this type of string: "March 10, 2015 at 6:08:33 PM PDT"
var safariParser = /^(\w+) (\d+), (\d\d\d\d) at (\d+)\:(\d+)\:(\d+) ([AP]M) (\w+)$/;
DateTime.prototype.canUseSafariSpecialFallback = function() {
  var jsDate = new Date();
  return jsDate.toLocaleString().match(safariParser);
};

var tzOption = {timeZone: "UTC"};

/* 
Currently, any defined value for specForDate/Time means "show that particular component".
Eventually, we will support variations such as "short", "long", etc.

We have two formatters -- we deploy the one that best uses the JS environment's internationalization capabilities.
*/

var mapVirgilspecToJSspec = {
  date: {
    full: { month:"short", day:"numeric", year:"numeric" },
    fullnumeric: { month:"numeric", day:"numeric", year:"numeric" },
    year: { year:"numeric" },
    month: { month:"short" },
    fullmonth: { month:"long" },
    monthyear: { month:"short", year:"numeric" },
    fullmonthyear: { month:"long", year:"numeric" },
    daymonth: { month:"short", day:"2-digit" },
    weekday: { weekday:"short" },
    fullweekday: { weekday:"long" }
  },
  time: {
    abbrev: { hour:"numeric" },
    full: { hour:"numeric", minute:"2-digit" }
  }
};


function formatSophisticated (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date((this.ts*1000) + this.offset);

  if (specForDate) {
    var spec = Object.merge((mapVirgilspecToJSspec.date[specForDate] || {}), tzOption);
    retval = jsDate.toLocaleDateString(undefined, spec);  // offset has already been done via manip of the timestamp
  }
  if (specForTime) {
    var spec = Object.merge((mapVirgilspecToJSspec.time[specForTime] || {}), tzOption);
    retval += (retval ? " " : "") + (jsDate.toLocaleTimeString(undefined, spec).replace(/ AM$/,"am").replace(/ PM$/,"pm"));  // offset has already been done via manip of the timestamp
  }
  return retval;
};

// Warning: This will not produce meaningful results for negative numbers!
// Its use case is for month/date numbers, e.g. positive integers between 1 and 31 inclusive.
function zeroPad(n) {
  return ('00000'+n).slice(-2);
}

/*
  Problems with trying to do creative fallback:
  toLocaleString() produces radically different results across browsers+node environments.
  On safari: "March 10, 2015 at 6:08:33 PM PDT"
  On Node < v12: "Tue Mar 10 2015 18:08:33 GMT-0800 (PST)

  Since safari is the only important web browser not supporting the latest internationalization features,
  the intelligent fallback will be performed only for those matching the safari layout of information.

  There's no way to ask for "en-us" locale, so the fact is that this fallback approach
  will not operate in non-USA/Canada environments.  In those environments, the base fallback
  will be used, not the intelligent parser-based format.
*/

function formatFallbackBase (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date(this.ts*1000 + this.offset);
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

function formatFallbackSafari (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date(this.ts*1000 + this.offset);
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

DateTime.prototype.format = DateTime.prototype.canUseInternationalizationAPI() 
    ? 
    formatSophisticated 
    : 
    (DateTime.prototype.canUseSafariSpecialFallback() ? formatFallbackSafari : formatFallbackBase);

////////////////////////////
// The below conditional exportation allows this JS file to be 100% compatible with browser JS engines
// when copied/pasted into a JS console.  This facilitates testing this functionality
// specifically in browsers, since:
//    a) NODEver<12 does not support the sophisticated formatting functionality
//    b) NODEver<12 does not produce results even remotely similar to Safari's fallback formatter
//    c) Thus, testing in Safari's engine is key to ensuring fallback support in vizapps
//
if (typeof(module) != "undefined") {
  module.exports = DateTime;
}
