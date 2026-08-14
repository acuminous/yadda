const Yadda = require('yadda');
const assert = require('assert');

module.exports = (function () {
  const gender = {
    Fred: 'M',
    Sue: 'F',
  };

  const library = new Yadda.ContextBoundLibrary()

    .define('$patientName is a patient at $hospitalName hospital.', function (patientName, hospitalName, next) {
      this.ctx.patient = {
        name: patientName,
        gender: gender[patientName],
        chart: function () {
          return {
            name: this.name,
            gender: this.gender,
            speciality: this.speciality,
            complaint: this.complaint,
            admission: this.admission,
            discharge: {
              time: this.discharge.time,
              requirements: this.discharge.requirements,
            },
          };
        },
      };
      this.ctx.hospital = this.ctx.hospitals[hospitalName];
      next();
    })

    .define('His chart should reflect all of the above', function (next) {
      const patient = this.ctx.patient;
      const chart = patient.chart();
      assert.equal(chart.name, patient.name);
      assert.equal(chart.gender, patient.gender);
      assert.equal(chart.speciality, patient.speciality);
      assert.equal(chart.complaint, patient.complaint);
      assert.equal(chart.admission, patient.admission);
      assert.equal(chart.discharge.time, patient.discharge.time);
      assert.deepEqual(chart.discharge.requirements.toString(), patient.discharge.requirements.toString());
      next();
    });

  return library;
})();
