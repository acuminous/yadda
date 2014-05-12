/* jslint node: true */
/* global mocha, featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {

    var MiddletonHospital = {
        getWard: function(speciality) {
            return this.wards[speciality];
        },
        wards: {
            respiratory: {
                admit: function(patient, timestamp) {
                    patient.ward = this;
                    patient.admission = timestamp;
                },
                scheduleDischarge: function(patient, timestamp) {
                    patient.discharge = { time: timestamp };
                }
            }
        }
    };

    featureFile(file, function(feature) {

        var libraies = [
            require('./lib/hospital-library'),
            require('./lib/patient-library'),
            require('./lib/discharge-library')
        ];

        var yadda = new Yadda.Yadda(libraies);

        scenarios(feature.scenarios, function(scenario) {
            var ctx = { hospitals: { Middleton: MiddletonHospital }};
            steps(scenario.steps, function(step, done) {
                yadda.yadda(step, {ctx: ctx}, done);
            });
        });
    });
});
