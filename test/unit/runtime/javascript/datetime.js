var reqInternal = require('require-internal');
var DateTime = reqInternal.require('../../../../runtime/javascript/datetime');

var DateTimeInternals = reqInternal.getInternals(DateTime);
var canUseInternationalizationAPI = DateTimeInternals.canUseInternationalizationAPI;
var canUseSafariSpecialFallback = DateTimeInternals.canUseSafariSpecialFallback;



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


// BE AWARE: this test is highly environment-dependent.
// Future changes in the screwdriver environment (e.g. moving to new NodeJS version)
// may cause this test to fail, in which case the test must be updated to match
// the new environment.
test('unit', 'runtime', 'javascript', 'DateTime', 'environment-detection', function() {
  // This assert assumes the NodeJS that was in use in screwdriver environment in 2014 and early 2015.
  // Upon any move to more-modern NodeJS versions with sophisticated Date/Time localization support,
  // this test will need modifications!
  assert.equal(canUseInternationalizationAPI(), false);

  // Unfortunately, this test cannot be hyper-specific because "canUse...()" function
  // will return different values in different NodeJS environments.  All we can really
  // do here is test that the function:  1) exists, and 2) does not throw an exception.
  // I have tested it in specific environments (including browser JS-consoles of course)
  // using "manual" test techniques.
  assert.ok(!!canUseSafariSpecialFallback);
  assert.ok(canUseSafariSpecialFallback() || true); // << just to ensure no exception thrown
  
  // Test the backdoor override that allows this test module to test even portions
  // of the runtime class that it should not have access to:
  DateTimeInternals.doForceUseOfSafariFallback(true);
  assert.equal(canUseSafariSpecialFallback(), true);
  DateTimeInternals.doForceUseOfSafariFallback(false);
});

var timestampFixed = 1181056120;

test('unit', 'runtime', 'javascript', 'DateTime', 'format-GMT', function() {

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var strdtUTC = dtUTC.format('fullnumeric', 'full');
  assert.equal("6/5/2007 15:08:40", strdtUTC);

  var dtGMT = dtUTC.toGMT();
  assert.equal(strdtUTC, dtGMT.format('fullnumeric', 'full'));
});



test('unit', 'runtime', 'javascript', 'DateTime', 'format-localTimeZone', function() {
  ////////////////////////////
  // This test is tricky because the results will indeed vary,
  // based on the timezone of the nodejs engine and even
  // if DST is in effect.
  // I will thus exact-check the result only if local==GMT 
  // (which seems to be the case in screwdriverland).
  // For others, I will just check the minutes/seconds and
  // ignore the hour.
  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var dtLocal = dtUTC.toLocal();
  var strdtLocal = dtLocal.format('full', 'full');

  if (dtLocal.offset == 0) {  //GMT
    if (canUseInternationalizationAPI()) {
      assert.equal("Jun 5, 2007 3:08pm", strdtLocal);
    }else{
      assert.equal("6/5/2007 15:08:40", strdtLocal);
    }
  }else{
    if (canUseInternationalizationAPI()) {
      assert(strdtLocal.match(/Jun 5, 2007 \d+\:08[ap]m/i));
    }else{
      assert(strdtLocal.match(/6\/5\/2007 \d+\:08\:40/));
    }
  }
});



test('unit', 'runtime', 'javascript', 'DateTime', 'format-fixedTimeZone', function() {

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var dtPacificSummer = dtUTC.toOffset(-7*60*60);
  strdtLocal = dtPacificSummer.format('full', 'full');

  if (canUseInternationalizationAPI()) {
    assert.equal("Jun 5, 2007 8:08am", strdtLocal);
  }else{
    assert.equal("6/5/2007 08:08:40", strdtLocal);
  }

  var strdtLocalTimeOnly = dtPacificSummer.format(null, 'short');
  assert(strdtLocalTimeOnly.length < strdtLocal.length);

  var strdtLocalDateOnly = dtPacificSummer.format("short", null);
  assert(strdtLocalDateOnly.length < strdtLocal.length);
  assert(strdtLocalDateOnly != strdtLocalTimeOnly);

});



test('unit', 'runtime', 'javascript', 'DateTime', 'format-safari', function() {

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var dtPacificSummer = dtUTC.toOffset(-7*60*60);

  var safariSimulator = {
    localeStr: "June 5, 2007 at 3:08:40 PM PDT",
    str: "Tue Jun 05 2007 15:08:40 GMT-0700 (PDT)"
  };

  function test(specDate, specTime, target) {
    var safariTest = dtPacificSummer.formatViaParseExtract(safariSimulator.localeStr, safariSimulator.str, specDate, specTime);
    assert.equal(safariTest, target);
  }

  // Emit the date portion only
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

  // Emit the time portion only
  test(null, "full", "3:08pm");
  test(null, "abbrev", "3pm");

  // Emit both portions
  test("fullweekday", "full", "Tuesday 3:08pm");

});



test('unit', 'runtime', 'javascript', 'DateTime', 'force-100perc-coverage', function() {

  // For the sake of coverage, this is done even though 
  // on non-sophisticated NodeJS environments, it will simply call the base fallback alg.
  // To simplify the string compare, we force use of Pacific Daylight time.

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var dtPacificSummer = dtUTC.toOffset(-7*60*60);

  assert.equal(dtPacificSummer.formatFallbackSafari("full", "full"), "6/5/2007 08:08:40");
  assert.equal(dtPacificSummer.formatSophisticated("full", null), "Tuesday, June 05, 2007");
  if ( ! (canUseInternationalizationAPI())) {
    assert.match(dtPacificSummer.formatSophisticated("full", "full"), /Tuesday, June 05, 2007 \d\d:08:40/);
    assert.match(dtPacificSummer.formatSophisticated(null, "full"), /\d\d:08:40/);
  }
  assert.match(dtPacificSummer.format(null, "full"), /8:08/);

  // IF this environment does not support truly localized date formattin,
  // for the sake of coverage, we monkeypatch JS's Date class toLocaleDateString() to fake
  // such support.
  if ( ! (canUseInternationalizationAPI())) {
    Date.prototype.toLocaleDateStringOrig = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function(localeselector) {
      return localeselector; // ensures 
    }
    DateTimeInternals.chooseFormatter();

    var dt = new DateTime();
    var resultIsUnimportant = dt.format("full","full");

    // Undo the monkey patch
    Date.prototype.toLocaleDateString = Date.prototype.toLocaleDateStringOrig;

    // For the sake of coverage, we force safari-environment:
    DateTimeInternals.doForceUseOfSafariFallback(true);
    DateTimeInternals.chooseFormatter();
    dt = new DateTime();
    resultIsUnimportant = dt.format("full","full");
    DateTimeInternals.doForceUseOfSafariFallback(false);
  }
});
