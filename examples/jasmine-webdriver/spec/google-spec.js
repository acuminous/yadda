var webdriver = require('selenium-webdriver');
test = require('selenium-webdriver/testing');
var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncScenarioLevelPlugin.init();

require('jasmine-before-all');

jasmine.getEnv().defaultTimeoutInterval = 10000;
var flow = webdriver.promise.controlFlow();

var library = require('../google-library');


describe('Google', function() {

    var driver;

    beforeAll(function() {
        driver = new webdriver.Builder()
            .withCapabilities(webdriver.Capabilities.chrome())
            .build();
    })

    new Yadda.FeatureFileSearch('features').each(function(file) {       
        featureFile(file, function(feature) {
            scenarios(feature.scenarios, function(scenario, done) {
                executeInFlow(function() {
                    new Yadda.Yadda(library, { driver: driver }).yadda(scenario.steps);
                }, done);
            });

        })
    })

    afterAll(function(done) {
        driver.quit().then(function() {
            done();
        }, done);
    })    

})

function executeInFlow(fn, done) {
    flow.execute(fn).then(function() {
        done();
    }, done);    
}
