var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var library = require('./google-library');
var webdriver = require('selenium-webdriver');
var driver;

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {

        before(function(done) {
            driver = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();
            driver.manage().timeouts().implicitlyWait(10000);
            done();
        })

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                new Yadda.Yadda(library, { driver: driver }).yadda(step, done);
            })
        });

        after(function(done) {
            driver.quit().then(done);
        })
    });
});