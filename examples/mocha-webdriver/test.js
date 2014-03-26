var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var library = require('./google-library');
var webdriver = require('selenium-webdriver');
var fs = require('fs');
var driver;

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {

        before(function(done) {
            driver = new webdriver
                .Builder()
                .usingServer()
                .withCapabilities({'browserName': 'chrome'})
                .build();
            driver.manage().timeouts().implicitlyWait(10000);
            done();
        });

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                executeInFlow(function() {
                    new Yadda.Yadda(library, {driver: driver}).yadda(step);
                }, done);
            });
        });

        afterEach(function() {
            takeScreenshotOnFailure(this.currentTest);
        });

        after(function(done) {
            driver.quit().then(done);
        });
    });
});

function executeInFlow(fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(
        function() {
            done();
        },
        done);
}

function takeScreenshotOnFailure(test) {
    if (test.status != 'passed') {
        var path = 'screenshots/' +
                    test.title.replace(/\W+/g, '_').toLowerCase() +
                    '.png';
        driver.takeScreenshot().then(function(data) {
            fs.writeFileSync(path, data, 'base64');
        });
    }
}
