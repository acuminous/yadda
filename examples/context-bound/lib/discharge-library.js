const Yadda = require('yadda');
const assert = require('assert');

module.exports = (function () {
  const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

  const library = new Yadda.ContextBoundLibrary()

    .define('His condition has improved sufficiently for him to be scheduled for discharge (today|tomorrow) at $time.', function (day, time, next) {
      const patient = this.ctx.patient;
      const timestamp = toTime(day, time);
      patient.ward.scheduleDischarge(patient, timestamp);
      next();
    })

    .define(
      ['He requires a $requirement', 'He requires a $requirement and some $requirement.'],
      function () {
        const next = Array.prototype.pop.apply(arguments);
        const requirements = Array.prototype.slice.apply(arguments);
        const patient = this.ctx.patient;
        patient.discharge.requirements = requirements;
        next();
      },
      {},
      { mode: 'async' }
    );

  function toTime(day, time) {
    const offset = day == 'today' ? 0 : ONE_DAY_IN_MILLIS;
    return Date.parse(new Date().toString().replace(/\d{2}:\d{2}:\d{2}/, time + ':00')) + offset;
  }

  return library;
})();
