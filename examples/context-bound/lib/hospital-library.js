const Yadda = require('yadda');
const assert = require('assert');

module.exports = (function () {
  const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

  const dictionary = new Yadda.Dictionary().define('NUM', /(\d+)/);

  const library = new Yadda.ContextBoundLibrary(dictionary).define('He was admitted to the $speciality ward with $complaint $num days ago.', function (speciality, complaint, daysAgo, next) {
    const patient = this.ctx.patient;
    patient.speciality = speciality;
    patient.complaint = complaint;
    const hospital = this.ctx.hospital;
    const ward = hospital.getWard(speciality);
    const admission = new Date().getTime() - ONE_DAY_IN_MILLIS * 2;
    const bed = ward.admit(patient, admission);
    next();
  });

  return library;
})();
