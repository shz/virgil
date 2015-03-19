var DateTime = function DateTime(spec) {
  this.ts = (spec && typeof spec.ts == 'number') ? spec.ts : ((Date.now()/1000)|0);
  this.offset = (spec && typeof spec.offset == 'number') ? (spec.offset) : 0;
};

// This is NOT exposed in the Virgil language, but is valuable for
// converting from a Virgil DateTime object to a JS Date object for
// internal processing.
DateTime.prototype.toJSDate = function() {
  return new Date((this.ts + this.offset) * 1000);
}

DateTime.prototype.toGMT = function() {
  return new DateTime({ts: this.ts, offset: 0});
}

DateTime.prototype.toLocal = function() {
  // Keep in mind: getTimezoneOffset() returns its value in terms of *minutes*.
  // Keep in mind: getTimezoneOffset() returns a *positive* number for TZs in the USA,
  //    e.g. its polarity is opposite of what we're looking for, thus the
  //    negation being done via "* -60".
  return new DateTime({ts: this.ts, offset: this.toJSDate().getTimezoneOffset() * -60});
}

DateTime.prototype.toOffset = function(newoffset) {
  return new DateTime({ts: this.ts, offset: newoffset});
}

//
// HELPER FUNCTIONS
//
// Internal helper functions used to determine the
// amount of sophistication present in the runtime environment.
var canUseInternationalizationAPI = function() {
  var jsDate = new Date();
  return (typeof(jsDate.toLocaleDateString) == 'function') && (jsDate.toLocaleDateString('en-US') != jsDate.toLocaleDateString('de-AT'));
};

// On safari, the toLocaleString returns this type of string: "March 10, 2015 at 6:08:33 PM PDT"
var safariParser = /^(\w+) (\d+), (\d\d\d\d) at (\d+)\:(\d+)\:(\d+) ([AP]M) (\w+)$/i;

// This "force" feature is used by the test harness to allow NodeJS to 
// test with 100% coverage, simulating the "Safari-like" browser environment which is
// special to this logic.
var forceUseOfSafariFallback = false;
var doForceUseOfSafariFallback = function(val) {
  forceUseOfSafariFallback = val;
};

// Are we using an environment (e.g. Safari circa 2014) that does not
// have rich support for localization of date/time BUT which has a result
// that meets the aforementioned safariParser regex pattern?  If so, we
// have a semi-rich fallback that we can use to produce fairly good
// results.
var canUseSafariSpecialFallback = function() {
  if (forceUseOfSafariFallback) {
    return true;
  }else{
    var jsDate = new Date();
    var retMatch = jsDate.toLocaleString().match(safariParser);
    
    // Coverage of the next line will never be 100% because in NodeJS, str.match() returns null instead of 
    // the [] or [""] used in some other JS environments.
    // Thus, our fascistic approach to coverage (100% mandated!) requires the following "ignore".
    /* istanbul ignore next */
    return (!!retMatch) && (retMatch.length > 1);
  }
};


//
// ASSISTANCE IN CONVERTING DATA WHEN USING FALLBACK ALGORITHMS:
//
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

var fullWeekdayFromShortWeekday = {
  "Sun": "Sunday",
  "Mon": "Monday",
  "Tue": "Tuesday",
  "Wed": "Wednesday",
  "Thu": "Thursday",
  "Fri": "Friday",
  "Sat": "Saturday"
};

var mapVirgilspecToJSspec = {
  date: {
    full: { month:"short", day:"numeric", year:"numeric", timeZone: "UTC"},
    fullnumeric: { month:"numeric", day:"numeric", year:"numeric", timeZone: "UTC" },
    year: { year:"numeric", timeZone: "UTC" },
    month: { month:"short", timeZone: "UTC" },
    fullmonth: { month:"long", timeZone: "UTC" },
    monthyear: { month:"short", year:"numeric", timeZone: "UTC" },
    fullmonthyear: { month:"long", year:"numeric", timeZone: "UTC" },
    daymonth: { month:"short", day:"2-digit", timeZone: "UTC" },
    weekday: { weekday:"short", timeZone: "UTC" },
    fullweekday: { weekday:"long", timeZone: "UTC" }
  },
  time: {
    abbrev: { hour:"numeric", timeZone: "UTC" },
    full: { hour:"numeric", minute:"2-digit", timeZone: "UTC" }
  }
};

//
//
// ENVIRONMENT-SPECIFIC DETERMINATION OF THE .format IMPLEMENTATION
//
// At runtime, exactly once, the environment is analyzed to determine
// which of the following DateTime.prototype methods:
//    formatSophisticated
//    formatFallbackSafari
//    formatFallbackBase
// should be used to implement this:
//    format(...)
// 
// Below you will find the three "candidate" formatting methods.
//
// The runtime selection of the proper candidate to use is done by
// the internal function:
//    chooseFormatter

//
// CANDIDATE FORMATTER #1
//
DateTime.prototype.formatSophisticated = function (specForDate, specForTime) {
  var retval = "";
  var jsDate = this.toJSDate();

  if (specForDate) {
    var spec = mapVirgilspecToJSspec.date[specForDate];
    retval = jsDate.toLocaleDateString(undefined, spec);  // offset has already been done via manip of the timestamp
  }
  if (specForTime) {
    var spec = mapVirgilspecToJSspec.time[specForTime];
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

//
// CANDIDATE FORMATTER #2
//
DateTime.prototype.formatFallbackBase = function (specForDate, specForTime) {
  var retval = "";
  var jsDate = this.toJSDate();
  if (specForDate) {
    // Very basic: just american style mm/dd/yyyy
    retval = (jsDate.getUTCMonth()+1) + "/" + (jsDate.getUTCDate()) + "/" + (jsDate.getUTCFullYear());  // offset has already been done via manip of the timestamp
  }
  if (specForTime) {
    // Very basic: just a basic hh:mm:ss in military time
    retval += (retval ? " " : "") + zeroPad(jsDate.getUTCHours()) + ':' + zeroPad(jsDate.getUTCMinutes()) + ':' + zeroPad(jsDate.getUTCSeconds());  // offset has already been done via manip of the timestamp
  }
  return retval;
};

//
// CANDIDATE FORMATTER #3
//
DateTime.prototype.formatFallbackSafari = function (specForDate, specForTime) {
  // This gets pretty funky.  We cannot use this.toJSDate() to produce the JS Date that
  // will govern this rendering, but we *do* need to use this.toJSDate() to get the timezone offset.
  // It is NOT correct to use:  new Date().getTimezoneOffset() to get that offset because
  // that would not handle DST correctly; it would determine DST based on the current date
  // not based on the date represented by this datetime object.
  // Q: Why do we need to undo the getTimezoneOffset at all?  Why not call toJSDate?
  // A: Because on these old systems, .toLocaleString and .toString both unconditionally
  // try to convert to local TZ and thus we need to add back the tz offset to undo that fascism.
  var jsDate = new Date( (this.ts+this.offset)*1000 + (this.toJSDate().getTimezoneOffset()*60*1000) );

  return this.formatViaParseExtract(jsDate.toLocaleString(), jsDate.toString(), specForDate, specForTime);
};

// This "helper" method for formatFallbackSafari has been made a distinct method in this class
// to allow the test harness to access it for testing purposes, since the test environment
// will not necessarily have access to a sophisticated implementation of Date#toLocaleString().
DateTime.prototype.formatViaParseExtract = function (jsDateLocaleStr, jsDateStr, specForDate, specForTime) {
  var retval = "";

  var renderedComponents = jsDateLocaleStr.match(safariParser);

  if (renderedComponents) {
    // IF WE GET HERE, the given jsDateLocaleStr exactly matches
    // the signature of English-locale Safari.

    // We can thus perform a sophisticated fallback via the already-extracted components.

    // Derive the short month (3-alpha) from the full month
    renderedComponents.push(renderedComponents[idxSafariComponent.monthFull].slice(0,3));

    // One problem: weekday name is NOT available fro toLocaleString, thus:
    // Compute the weekday name via toString()
    var weekdayShort = jsDateStr.match(/^(...)/)[1];
    var weekdayLong  = fullWeekdayFromShortWeekday[weekdayShort];

    // Abbreviations to simplify below code
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
        strDate = weekdayShort;
        break;
      case "fullweekday": 
        strDate = weekdayLong;
        break;
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
        strTime = rc[idx.hour] + rc[idx.ampm].toLowerCase(); 
        break;
      case "full":
      default:
        strTime = rc[idx.hour] + ":" + rc[idx.minute] + rc[idx.ampm].toLowerCase(); 
        break;
      }
      retval += (retval ? " " : "") + strTime;
    }
    return retval;

  }else{

    // What we were given was NOT an English-safari-format string!
    // So we have no choice but to fallback even further, to our very basic
    // rudimentary formatter.
    return this.formatFallbackBase(specForDate, specForTime);

  }
};

// Runtime determination of the best-fit formatter for this environment.
// This is executed only once in production environments.
// However, the test harness has the right to directly execute this to simulate
// various environments.
var chooseFormatter = function() {
  DateTime.prototype.format = canUseInternationalizationAPI() 
    ? 
    DateTime.prototype.formatSophisticated 
    : 
    (canUseSafariSpecialFallback() ? DateTime.prototype.formatFallbackSafari : DateTime.prototype.formatFallbackBase);
};

// The load-time invocation that is done just once in true production environments:
chooseFormatter();


////////////////////////////
// The below conditional exportation allows this JS file to be 100% compatible with browser JS engines
// when copied/pasted into a JS console.  This facilitates testing this functionality
// specifically in browsers, since:
//    a) NODEver<12 does not support the sophisticated formatting functionality.
//    b) NODEver<12 does not produce results even remotely similar to Safari's fallback formatter.
//    c) Thus, testing in Safari's actual JS environment is essential to ensuring fallback support in vizapps.
//
/* istanbul ignore next */
if (typeof(module) != "undefined") {
  module.exports = DateTime;
}
else {
  /* istanbul ignore next */
  //
  // The following is executed ONLY when this JS is copied as-is in-full into a browser's JS console.
  // This allows for testing this in true-browser environments, performing testing that is not possible
  // in automated test nodejs-based environments, thus achieving super-high accuracy in testing this package's
  // highly-sensitive-to-the-runtime-environment logic.
  //
  (function(){
    var x = new DateTime({ts:1181056120});
    function test(specDate, specTime, target) {
      var result = x.format(specDate, specTime);
      if (target != result) {
        console.log("FAILURE: format("+specDate+", "+specTime+") produced '" + result + "' != expected '" + target + "'");
      }
    }

    console.log("START OF TESTING!  Only failures will be reported.");
    console.log("Testing date formatting...");
    test("full",null,"Jun 5, 2007");
    test("fullnumeric",null,"6/5/2007");
    test("year",null,"2007");
    test("month",null,"Jun");
    test("fullmonth",null,"June");
    test("monthyear",null,"Jun 2007");
    test("fullmonthyear",null,"June 2007");
    test("daymonth",null,"Jun 05");
    test("weekday",null,"Tue");
    test("fullweekday",null,"Tuesday");
    console.log("Testing time formatting...");
    test(null, "full", "3:08pm");
    test(null, "abbrev", "3pm");
    x = x.toOffset(-7*60*60);
    test(null, "full", "8:08am");
    test(null, "abbrev", "8am");
    console.log("Testing local (will only work in Pacific Daylight time)..");
    x = x.toLocal();
    test(null, "full", "8:08am");
    test(null, "abbrev", "8am");
    console.log("END OF TESTING!  Please address any failures noted above.");
  })();
}
