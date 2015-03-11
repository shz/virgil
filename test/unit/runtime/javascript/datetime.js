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
  var timestampFixed = 1425430319;

  var dtUTC = new DateTime({ts: timestampFixed, offset: 0});
  var strdtUTC = dtUTC.format('short', 'short');

  // This assumes NodeJS v0.10.x -- upon move to newest NodeJS, this test will need mods.
  assert.equal("3/4/2015 00:51:59", strdtUTC);

  var dtLocal = dtUTC.toLocal();
  var strdtLocal = dtLocal.format('full', 'full');

  if (dtUTC.canUseInternationalizationAPI()) {
    assert("Mar 3, 2015 4:51pm" != strdtLocal);
  }else{
    assert("3/3/2015 16:51:59" != strdtLocal);
  }

  var strdtLocalTimeOnly = dtLocal.format(null, 'short');
  assert(strdtLocalTimeOnly.length < strdtLocal.length);

  var strdtLocalDateOnly = dtLocal.format("short", null);
  assert(strdtLocalDateOnly.length < strdtLocal.length);
  assert(strdtLocalDateOnly != strdtLocalTimeOnly);

});

