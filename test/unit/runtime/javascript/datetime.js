// var reqInternal = require('require-internal');
// var DateTime = reqInternal.require('../../../../runtime/javascript/datetime');

// var DateTimeInternals = reqInternal.getInternals(DateTime);

// We need a monkey patch around the include of DateTime in order to
// trick the module into believing that it can use the i18n api.
var tmp = Date.prototype.toLocaleString;
Date.prototype.toLocaleString = function(x) { return x };
var DateTime = require('../../../../runtime/javascript/datetime');
Date.prototype.toLocaleString = tmp;

var THE_BEST_TIME = 1181056120;


test('unit', 'runtime', 'javascript', 'DateTime', 'constructor', function() {
  var dtInMS = +new Date();  // result is in milliseconds
  var dt = new DateTime();  // dt.ts is in seconds
  var dt2 = new DateTime(dt);  // clone

  // Default for DateTime is GMT
  assert.equal(dt.offset, 0);

  // The difference between the Date and DateTime timestamps should
  // be similar but not identical -- should not exceed two seconds.
  // The difference is not going to be zero due to the difference in resolution.
  assert(Math.abs(dt.ts - (dtInMS/1000)) < 2);

  // But the difference between the two DateTime objects should be zero, as
  // one was created as a clone of the other.
  assert.equal(dt.ts, dt2.ts);
  assert.equal(dt.offset, dt2.offset);
});

test('unit', 'runtime', 'javascript', 'DateTime', 'offsets', function() {
  var base = new DateTime({ts: THE_BEST_TIME, offset: 0});

  var dtGMT = base.toGMT();
  assert.equal(dtGMT.offset, 0);
  assert.equal(dtGMT.ts, THE_BEST_TIME);

  var dtMalaysia = base.toOffset(8*60*60);
  assert.equal(dtMalaysia.offset, 8*60*60);
  assert.equal(dtMalaysia.ts, THE_BEST_TIME);

  var dtLocal = base.toLocal();
  assert.equal(dtLocal.offset, new Date().getTimezoneOffset() * -60);
  assert.equal(dtLocal.ts, THE_BEST_TIME);
});

test('unit', 'runtime', 'javascript', 'DateTime', 'toJSDate', function() {
  var dt = new DateTime({ts: THE_BEST_TIME, offset: 0});
  var jsdt = dt.toJSDate();

  assert.equal(+jsdt, THE_BEST_TIME * 1000);
  assert.equal(jsdt.toISOString(), "2007-06-05T15:08:40.000Z");

  dt = dt.toOffset(1);
  jsdt = dt.toJSDate();
  assert.equal(+jsdt, (THE_BEST_TIME + 1) * 1000);
  assert.equal(jsdt.toISOString(), '2007-06-05T15:08:41.000Z');

  dt = dt.toLocal();
  jsdt = dt.toJSDate();
  var reference = new Date((THE_BEST_TIME + (new Date().getTimezoneOffset() * -60)) * 1000);
  assert.equal(+jsdt, +reference);
  assert.equal(jsdt.toISOString(), reference.toISOString());
});

test('unit', 'runtime', 'javascript', 'DateTime', 'format', function(done) {
  var dt = new DateTime({ ts: THE_BEST_TIME });

  // Test behavior under ISO fallback
  assert.throws(function() {
    dt.format('bogus', null);
  }, /format/i);
  assert.throws(function() {
    dt.format(null, 'bogus');
  }, /format/i);

  assert.equal(dt.format(), '');

  assert.equal(dt.format('full', ''), 'Jun 5, 2007');
  assert.equal(dt.format('fullnumeric', null), '6/5/2007');
  assert.equal(dt.format('year'), '2007');
  assert.equal(dt.format('month'), 'Jun');
  assert.equal(dt.format('fullmonth'), 'June');
  assert.equal(dt.format('monthyear'), 'Jun 2007');
  assert.equal(dt.format('fullmonthyear'), 'June 2007');
  assert.equal(dt.format('daymonth'), 'Jun 05');
  assert.equal(dt.format('weekday'), 'Tue');
  assert.equal(dt.format('fullweekday'), 'Tuesday');

  assert.equal(dt.format('', 'full'), '3:08pm');
  assert.equal(dt.format(null, 'abbrev'), '3pm');

  assert.equal(dt.format('full', 'full'), 'Jun 5, 2007 3:08pm');
  assert.equal(dt.format('fullweekday', 'abbrev'), 'Tuesday 3pm');
  assert.equal(dt.format('daymonth', 'full'), 'Jun 05 3:08pm');
  assert.equal(dt.format('fullnumeric', 'abbrev'), '6/5/2007 3pm');

  // Check the AM too
  var dt2 = new DateTime({ ts: THE_BEST_TIME - (12 * 60 * 60) + (3 * 60) });
  assert.equal(dt2.format(null, 'abbrev'), '3am');
  assert.equal(dt2.format(null, 'full'), '3:11am');

  // Fake out the i18n API
  var called = [];
  var tmp = Date.prototype.toLocaleString;
  Date.prototype.toLocaleString = function(lang, format) {
    called.push({ lang: lang, format: format });
    return '1 AM';
  };
  global.language = 'de-AT';
  done.cleanup(function() {
    delete global.language;
    Date.prototype.toLocaleString = tmp;
  });

  assert.equal(dt.format('full'), '1am');
  assert.equal(called.length, 1);
  assert.equal(called[0].lang, 'de-AT');
  assert.ok(typeof called[0].format, 'object');
  assert.ok(Object.keys(called[0].format).length > 0);

  assert.equal(dt.format('full', 'full'), '1am');
  assert.equal(called.length, 2);
  assert.equal(called[1].lang, 'de-AT');
  assert.ok(typeof called[1].format, 'object');
  assert.ok(Object.keys(called[1].format).length > 0);

  assert.equal(dt.format(null, 'full'), '1am');
  assert.equal(called.length, 3);
  assert.equal(called[2].lang, 'de-AT');
  assert.ok(typeof called[2].format, 'object');
  assert.ok(Object.keys(called[2].format).length > 0);

  done();
});
