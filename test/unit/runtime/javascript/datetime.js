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

test('unit', 'runtime', 'javascript', 'DateTime', 'localization', function() {
  var timestampFixed = 1181056120;

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var strdtUTC = dtUTC.format('fullnumeric', 'full');

  // This assumes NodeJS v0.10.x -- upon move to newest NodeJS, this test will need mods.
  assert.equal("6/5/2007 15:08:40", strdtUTC);

  //////////////////////////////
  var dtGMT = dtUTC.toGMT();
  assert.equal(strdtUTC, dtGMT.format('fullnumeric', 'full'));

  ////////////////////////////
  var dtLocal = dtUTC.toLocal();
  var strdtLocal = dtLocal.format('full', 'full');

  if (dtUTC.canUseInternationalizationAPI()) {
    assert.equal("Jun 5, 2007 8:08am", strdtLocal);
  }else{
    assert.equal("6/5/2007 08:08:40", strdtLocal);
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

  /////////////////////////////////
  // For the sake of coverage, this is done even though on NodeJS < 0.12
  // it will simply call the base fallback alg.
  assert.equal(dtLocal.formatFallbackSafari("full", "full"), "6/5/2007 08:08:40");
  assert.equal(dtLocal.formatSophisticated("full", "full"), "Tuesday, June 05, 2007 01:08:40");

});
