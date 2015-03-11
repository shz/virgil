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
var idxSafariComponent = {
  monthFull: 1,
  day: 2,
  year: 3,
  hour : 4,
  minute: 5,
  second: 6,
  ampm: 7,
  tz: 8,
  monthShort: 9  // derived
};

var monthNumberFromEnglish = {
  "Jan": 1,
  "Feb": 2,
  "Mar": 3,
  "Apr": 4,
  "May": 5,
  "Jun": 6,
  "Jul": 7,
  "Aug": 8,
  "Sep": 9,
  "Oct": 10,
  "Nov": 11,
  "Dec": 12
};

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

// On safari: "March 10, 2015 at 6:08:33 PM PDT"
function formatFallbackSafari (specForDate, specForTime) {
  var retval = "";
  var jsDate = new Date(this.ts*1000 + this.offset);
  var renderedComponents = jsDate.toLocaleString().match(safariParser);
  if (renderedComponents) {
    // Derive the short month (3-alpha) from the full month
    renderedComponents.push(renderedComponents[idxSafariComponent.monthFull].slice(0,3));
    var rc = renderedComponents;
    var idx = idxSafariComponent;
    if (specForDate) {
      var strDate = "";
      switch(specForDate) {
      case "full": 
        strDate = rc[idx.monthShort] + " " + rc[idx.day] + ", " + rc[idx.year]; 
        break;
      case "year": 
        strDate = rc[idx.year]; 
        break;
      case "month":
        strDate = rc[idx.monthShort];
        break;
      case "fullmonth":
        strDate = rc[idx.monthFull];
        break;
      case "monthyear":
        strDate = rc[idx.monthShort] + " " + rc[idx.year]; 
        break;
      case "fullmonthyear": 
        strDate = rc[idx.monthFull] + " " + rc[idx.year]; 
        break;
      case "daymonth": 
        strDate = rc[idx.monthShort] + " " + zeroPad(rc[idx.day]);
        break;
      case "weekday": 
      case "fullweekday": 
      case "fullnumeric":
      default:
        strDate = monthNumberFromEnglish[rc[idx.monthShort]] + "/" + rc[idx.day] + "/" + rc[idx.year]; 
        break;
      }
      retval = strDate;
    }
    if (specForTime) {
      var strTime = "";
      switch(specForTime) {
      case "abbrev":
        strTime = rc[idx.hour] + rc[idx.ampm]; 
        break;
      case "full":
      default:
        strTime = rc[idx.hour] + ":" + rc[idx.minute] + rc[idx.ampm]; 
        break;
      }
      retval += (retval ? " " : "") + strTime;
    }
    return retval;
  }else{
    // Wow, we are no longer feeling like this is a safari-format string!
    return formatFallbackBase(specForDate, specForTime);
  }
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
else {
  // When this entire JS code has been pasted into a browser console, run sanity checks (for a human to vet) automatically.
  // To run this browser-specific test, just:
  // 1) Visit sugarjs.com
  // 2) Open up JS console
  // 3) Paste this entire file's contents into the JS console.  
  var x = new DateTime({ts:1107615820});
  function test(specDate, specTime, target) {
    var result = x.format(specDate, specTime);
    if (target != result) {
      console.log("FAILURE: format("+specDate+", "+specTime+") produced '" + result + "' != expected '" + target + "'");
    }
  }

  console.log("START OF TESTING!  Only failures will be reported.");
  console.log("Testing date formatting...");
  test("full",null,"Feb 5, 2005");
  test("fullnumeric",null,"2/5/2005");
  test("year",null,"2005");
  test("month",null,"Feb");
  test("fullmonth",null,"February");
  test("monthyear",null,"Feb 2005");
  test("fullmonthyear",null,"February 2005");
  test("daymonth",null,"Feb 05");
  test("weekday",null,"Sat");
  test("fullweekday",null,"Saturday");
  console.log("Testing time formatting...");
  test(null, "full", "3:03pm");
  test(null, "abbrev", "3pm");
  console.log("END OF TESTING!  Please address any failures noted above.");
}












