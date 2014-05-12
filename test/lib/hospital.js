/* jslint node: true */
"use strict";

var Patient = function(full_name) {
    this.first_name = full_name.split(' ')[0];
    this.last_name = full_name.split(' ')[1];
    this.full_name = full_name;
    this.gender;
    this.speciality;
    this.template;
};

var Hospital = function(name) {
    this.name = name;
    this.patients = {};
    this.wards = {};

    this.add_ward = function(ward) {
        this.wards[ward.name] = ward;
        return ward;
    };

    this.is_ward = function(name) {
        return this.get_ward(name) !== undefined;
    };

    this.admit = function(patient) {
        this.patients[patient.first_name] = patient;
        this.patients[patient.full_name] = patient;
        return patient;
    };

    this.is_admitted = function(name) {
        return this.get_patient(name) !== undefined;
    };

    this.get_patient = function(name) {
        return this.patients[name];
    };

    this.get_ward = function(name) {
        return this.wards[name];
    };

    this.get_bed = function(number) {
        var bed;
        for (var ward in this.wards) {
            bed = this.wards[ward].get_bed(number);
            if (bed) break;
        }
        return bed;
    };
};

var Ward = function(name) {
    this.name = name;
    this.speciality;
    this.beds = {};

    this.get_bed = function(number) {
        return this.beds[number];
    };

    this.add_bed = function(bed) {
        /* jshint boss: true */
        return this.beds[bed.number] = bed;
    };
};

var Bed = function(ward, number) {
    this.ward = ward;
    this.number = number;
    this.gender;
    this.patient;

    this.admit = function(patient) {
        this.patient = patient;
        this.patient.template = (this.patient.speciality == this.ward.speciality) ? 'on' : 'off';
    };
};

module.exports = {
    Patient: Patient,
    Hospital: Hospital,
    Ward: Ward,
    Bed: Bed
};
