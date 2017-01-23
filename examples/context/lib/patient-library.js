"use strict";

var Yadda = require('yadda');
var assert = require('assert');

module.exports = (function() {

    var gender = {
        Fred: 'M',
        Sue: 'F'
    };

    var library = new Yadda.Library()

        .define('$patientName is a patient at $hospitalName hospital.', function(patientName, hospitalName, next) {
            this.ctx.patient = { name: patientName, gender: gender[patientName], chart: function() {
                return {
                    name: this.name,
                    gender: this.gender,
                    speciality: this.speciality,
                    complaint: this.complaint,
                    admission: this.admission,
                    discharge: {
                        time: this.discharge.time,
                        requirements: this.discharge.requirements
                    }
                };
            }};
            this.ctx.hospital = this.ctx.hospitals[hospitalName];
            next();
        })

        .define('His chart should reflect all of the above', function(next) {
            var patient = this.ctx.patient;
            var chart = patient.chart();
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
