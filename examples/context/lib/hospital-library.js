"use strict";

var Yadda = require('yadda');
var assert = require('assert');

module.exports = (function() {

    var ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

    var dictionary = new Yadda.Dictionary()
        .define('NUM', /(\d+)/);

    var library = new Yadda.Library(dictionary)

        .define('He was admitted to the $speciality ward with $complaint $num days ago.', function(speciality, complaint, daysAgo, next) {
            var patient = this.ctx.patient;
            patient.speciality = speciality;
            patient.complaint = complaint;
            var hospital = this.ctx.hospital;
            var ward = hospital.getWard(speciality);
            var admission = new Date().getTime() - ONE_DAY_IN_MILLIS * 2;
            var bed = ward.admit(patient, admission);
            next();
        });

    return library;

})();
