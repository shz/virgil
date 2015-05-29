var DateTime = module.exports = function DateTime(spec) {
  this.ts = (spec && typeof spec.ts == 'number') ? spec.ts : ((Date.now()/1000)|0);
  this.offset = (spec && typeof spec.offset == 'number') ? (spec.offset) : 0;
};

//
// This is NOT exposed in the Virgil language, but is valuable for
// converting from a Virgil DateTime object to a JS Date object for
// internal processing.
//
DateTime.prototype.toJSDate = function() {
  return new Date((this.ts + this.offset) * 1000);
}

//
// Converts a local date to GMT.  Has no effect if the DateTime is
// already in GMT.
//
DateTime.prototype.toGMT = function() {
  return new DateTime({
    ts: this.ts,
    offset: 0
  });
}

//
// Converts a DateTime to the local timezone, regardless of what
// the object's timezone is currently.  No effect if the DateTime is
// already a local time.
//
DateTime.prototype.toLocal = function() {
  return new DateTime({
    ts: this.ts,
    // .getTimezoneOffset() gives us minutes, and its polarity is the
    // opposite of what we're looking for, hence the * -60
    offset: (new Date()).getTimezoneOffset() * -60
  });
}

//
// Converts a DateTime to the specified offset
//
DateTime.prototype.toOffset = function(newoffset) {
  return new DateTime({
    ts: this.ts,
    offset: newoffset
  });
}

//
// Formats a DateTime with the specified date and time options
//
DateTime.prototype.format = function(date, time) {
  if (!date && !time) {
    return '';
  }

  return format(this.toJSDate(), date, time);
};

//
// Use the native i18n API if it's available
//
var USE_I18N_API = Date.prototype.toLocaleString &&
  (new Date(0).toLocaleString('en-US') !== new Date(0).toLocaleString('de-AT'));

//
// Mapping tables
//
var map = {
  month: [ 'January'
         , 'February'
         , 'March'
         , 'April'
         , 'May'
         , 'June'
         , 'July'
         , 'August'
         , 'September'
         , 'October'
         , 'November'
         , 'December'
         ],
  weekday: [ 'Sunday'
           , 'Monday'
           , 'Tuesday'
           , 'Wednesday'
           , 'Thursday'
           , 'Friday'
           , 'Saturday'
           ],

  // Virgil API to .toLocaleString() spec
  virgil: {
    date: {
      full: { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC'},
      fullnumeric: { month: 'numeric', day: 'numeric', year: 'numeric', timeZone: 'UTC' },
      year: { year: 'numeric', timeZone: 'UTC' },
      month: { month: 'short', timeZone: 'UTC' },
      fullmonth: { month: 'long', timeZone: 'UTC' },
      monthyear: { month: 'short', year: 'numeric', timeZone: 'UTC' },
      fullmonthyear: { month: 'long', year: 'numeric', timeZone: 'UTC' },
      daymonth: { month: 'short', day: '2-digit', timeZone: 'UTC' },
      weekday: { weekday: 'short', timeZone: 'UTC' },
      fullweekday: { weekday: 'long', timeZone: 'UTC' }
    },
    time: {
      abbrev: { hour: 'numeric', timeZone: 'UTC' },
      full: { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }
    }
  }
};

//
// Misc util
//
var merge = function(a, b) {
  var o = {};
  if (a) {
    for (var i in a) /* istanbul ignore else */ if (a.hasOwnProperty(i)) {
      o[i] = a[i];
    }
  }
  if (b) {
    for (var i in b) /* istanbul ignore else */ if (b.hasOwnProperty(i)) {
      o[i] = b[i];
    }
  }
  return o;
};
var pad = function(n) {
  if (n < 10) {
    return '0' + n;
  }
  return n;
};

//
// Ye olde grande formatter
//
var format = function(d, date, time) {
  // Easy mode -- we have access to the browser's i18n API and can
  // just use that directly.
  /* istanbul ignore next */
  var language = typeof navigator != 'undefined' ? navigator.language :
                 typeof global != 'undefined' ? global.language :
                 'en-US';
  if (USE_I18N_API && language && language != 'en-US') {
    return d.toLocaleString(language, merge(map.virgil.date[date], map.virgil.time[time]))
      .replace(/ AM$/, 'am').replace(/ PM$/, 'pm');
  }

  // Otherwise we have to resort to a fallback English-only ISO formatter
  var parts = [];
  if (date) {
    var day = d.getUTCDate();
    var weekday = d.getUTCDay();
    var month = d.getUTCMonth();
    var year = d.getUTCFullYear();

    switch (date) {
      case 'full':
        parts.push(map.month[month].substr(0, 3) + ' ' + day + ', ' + year); break;
      case 'fullnumeric':
        parts.push([month + 1, day, year].join('/')); break;
      case 'year':
        parts.push(year); break;
      case 'month':
        parts.push(map.month[month].substr(0, 3)); break;
      case 'fullmonth':
        parts.push(map.month[month]); break;
      case 'monthyear':
        parts.push(map.month[month].substr(0, 3) + ' ' + year); break;
      case 'fullmonthyear':
        parts.push(map.month[month] + ' ' + year); break;
      case 'daymonth':
        parts.push(map.month[month].substr(0, 3) + ' ' + pad(day)); break;
      case 'weekday':
        parts.push(map.weekday[weekday].substr(0, 3)); break;
      case 'fullweekday':
        parts.push(map.weekday[weekday]); break;
      default:
        throw new Error('Invalid date format ' + date);
    }
  }
  if (time) {
    var h = d.getUTCHours();
    var am = true;
    if (h > 12) {
      am = false;
      h -= 12;
    }
    switch (time) {
      case 'full':
        parts.push(h + ':' + pad(d.getUTCMinutes()) + (am ? 'am' : 'pm')); break;
      case 'abbrev':
        parts.push(h + (am ? 'am' : 'pm')); break;
      default:
        throw new Error('Invalid time format ' + time);
    }
  }

  return parts.join(' ');
};
