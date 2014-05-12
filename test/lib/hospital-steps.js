/* jslint node: true */
"use strict";

var assert = require('assert');
var English = require('../../lib/index').localisation.English;
var Hospital = require('./hospital').Hospital;
var Patient = require('./hospital').Patient;
var Ward = require('./hospital').Ward;
var Bed = require('./hospital').Bed;

module.exports.init = function() {

    var hospital, ward, patient, bed, he, she = null;

    var library = English.library()

        .given('that $name is a $gender, $speciality patient at $hospital hospital', function(patient_name, gender, speciality, hospital_name) {
            hospital = hospital ? hospital : new Hospital(hospital_name);
            patient = hospital.admit(new Patient(patient_name));
            patient.gender = gender;
            patient.speciality = speciality;
            she = he = patient;
        })
        .given('that $ward ward is a $speciality ward in $hospital hospital', function(ward_name, speciality, hospital_name) {
            hospital = hospital ? hospital : new Hospital(hospital_name);
            ward = hospital.is_ward(ward_name) ? hospital.get_ward(ward_name) : hospital.add_ward(new Ward(ward_name));
            ward.speciality = speciality;
        })
        .given('that bed $number is a $gender bed in $ward ward', function(number, gender, ward_name) {
            bed = ward.get_bed(number) ? ward.get_bed(number) : ward.add_bed(new Bed(ward, number));
            bed.gender = gender;
        })
        .when('$name is admitted to bed $number', function(name, number) {
            name.match(/he|she/) ? patient : hospital.get_patient(name);
            bed = hospital.get_bed(number);
            bed.admit(patient);
        })
        .then('$name is marked as $template template', function(name, template) {
            patient = name.match(/he|she/) ? patient : hospital.get_patient(name);
            assert.equal(patient.template, template);
        });

    return library;
};
