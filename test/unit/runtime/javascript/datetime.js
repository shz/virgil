var DateTime = require('../../../../runtime/javascript/datetime');

test('unit', 'runtime', 'javascript', 'DateTime', 'constructor', function() {
  var ahora = +new Date();
  var dt = new DateTime();
  assert.equal(dt.offset, 0);

  // The difference between the two timestamps should really not be exceeding one second, in most cases will be zero of course.
  assert((dt.ts - ahora) < 2);

  var dt2 = new DateTime(dt);
  assert.equal(dt.ts, dt2.ts);
  assert.equal(dt.offset, dt2.offset);
});  


// These assume NodeJS circa 2014 -- upon move to NodeJS versions with internationalization,
// this test will need mods and will likely fail.

test('unit', 'runtime', 'javascript', 'DateTime', 'localization', function() {
  var timestampFixed = 1181056120;

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var strdtUTC = dtUTC.format('fullnumeric', 'full');

  assert.equal("6/5/2007 15:08:40", strdtUTC);

  //////////////////////////////
  var dtGMT = dtUTC.toGMT();
  assert.equal(strdtUTC, dtGMT.format('fullnumeric', 'full'));

  ////////////////////////////
  // This test is tricky because the results will indeed vary,
  // based on the timezone of the nodejs engine and even
  // if DST is in effect.
  // I will thus exact-check the result only if local==GMT 
  // (which seems to be the case in screwdriverland).
  // For others, I will just check the minutes/seconds and
  // ignore the hour.
  var dtLocal = dtUTC.toLocal();
  var strdtLocal = dtLocal.format('full', 'full');

  if (dtLocal.offset == 0) {
    if (dtUTC.canUseInternationalizationAPI()) {
      assert.equal("Jun 5, 2007 8:08am", strdtLocal);
    }else{
      assert.equal("6/5/2007 08:08:40", strdtLocal);
    }
  }else{
    if (dtUTC.canUseInternationalizationAPI()) {
      assert(strdtLocal.match(/Jun 5, 2007 \d+\:08[ap]m/i));
    }else{
      assert(strdtLocal.match(/6\/5\/2007 \d+\:08\:40/));
    }
  }

  //////////////////////////////

  var dtPacificSummer = dtUTC.toOffset(-7*60*60);
  strdtLocal = dtPacificSummer.format('full', 'full');

  if (dtUTC.canUseInternationalizationAPI()) {
    assert.equal("Jun 5, 2007 8:08am", strdtLocal);
  }else{
    assert.equal("6/5/2007 08:08:40", strdtLocal);
  }

  var strdtLocalTimeOnly = dtLocal.format(null, 'short');
  assert(strdtLocalTimeOnly.length < strdtLocal.length);

  var strdtLocalDateOnly = dtLocal.format("short", null);
  assert(strdtLocalDateOnly.length < strdtLocal.length);
  assert(strdtLocalDateOnly != strdtLocalTimeOnly);

  ///////////////////////////////////////

  var safariSimulator = {
    localeStr: "June 5, 2007 at 3:08:40 PM PDT",
    str: "Tue Jun 05 2007 15:08:40 GMT-0700 (PDT)"
  };

  function test(specDate, specTime, target) {
    var safariTest = dtLocal.formatViaParseExtract(safariSimulator.localeStr, safariSimulator.str, specDate, specTime);
    assert.equal(safariTest, target);
  }

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

  test(null, "full", "3:08pm");
  test(null, "abbrev", "3pm");

  test("fullweekday", "full", "Tuesday 3:08pm");


  /////////////////////////////////
  // For the sake of coverage, this is done even though on NodeJS < 0.12
  // it will simply call the base fallback alg.
  assert.equal(dtLocal.formatFallbackSafari("full", "full"), "6/5/2007 08:08:40");
  assert.equal(dtLocal.formatSophisticated("full", "full"), "Tuesday, June 05, 2007 01:08:40");


  //////////////////////
  // IF this environment does not support truly localized date formattin,
  // for the sake of coverage, we monkeypatch JS's Date class toLocaleDateString() to fake
  // such support.
  if ( ! (dtLocal.canUseInternationalizationAPI())) {
    Date.prototype.toLocaleDateStringOrig = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function(localeselector) {
      return localeselector; // ensures 
    }
    DateTime.prototype.chooseFormatter();

    var dt = new DateTime();
    var resultIsUnimportant = dt.format("full","full");

    // Undo the monkey patch
    Date.prototype.toLocaleDateString = Date.prototype.toLocaleDateStringOrig;
  }
});
