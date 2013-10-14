var Yadda = require('yadda');
Yadda.plugins.mocha();
var library = require('./google-library');
var webdriver = require('selenium-webdriver');
var driver;

feature('./features/google.feature', function(feature) {

    before(function(done) {
        driver = new webdriver.Builder().usingServer().withCapabilities({'browserName': 'chrome'}).build();
        driver.manage().timeouts().implicitlyWait(10000);        
        done();
    })

    scenarios(feature.scenarios, function(scenario, done) {
        new Yadda.Yadda(library, { driver: driver }).yadda(scenario.steps, done);       
    });

    after(function(done) {
        driver.quit().then(done);
    })     
});