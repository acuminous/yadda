/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each(function(file) {


    before(function(done) {
        setTimeout(function() {
            console.log('\nRunning before feature\n')
            done()
        }, 100)
    })

    beforeEach(function(done) {
        setTimeout(function() {
            console.log('Running before each step due to step level plugin')
            done()
        }, 100)
    })

    afterEach(function(done) {
        setTimeout(function() {
            console.log('Running after each step due to step level plugin')
            done()
        }, 100)
    })


    after(function(done) {
        setTimeout(function() {
            console.log('Running after feature')
            done()
        }, 100)
    })

    featureFile(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {

        before(function(done) {
            setTimeout(function() {
                console.log('\nRunning before scenarios\n')
                done()
            }, 100)
        })

        after(function(done) {
            setTimeout(function() {
                console.log('\nRunning after scenarios\n')
                done()
            }, 100)
        })

            steps(scenario.steps, function(step, done) {
                yadda.run(step, done);
            });
        });
    });
});
