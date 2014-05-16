/* jslint node: true */
/* global before, afterEach, after, featureFile, scenarios, steps */
'use strict';

var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init();

var library = require('./google-library');
var fs = require('fs');
var wd = require('wd');

// Config that will be passed to `wd` to call appium.
var config = {
  'appium-version': '1.0',
  platformName: 'iOS',
  platformVersion: '7.1',
  deviceName: 'iPhone Simulator',
  browserName: 'safari',
  name: 'Appium Safari: with WD',
  newCommandTimeout: 60
};

var browser;

// Find every `xxx.feature` file in `features` dir.
new Yadda.FeatureFileSearch('features').each(function (file) {
  featureFile(file, function (feature) {

    before(function (done) {
      browser = wd.promiseChainRemote('localhost', 4723);
      // extra logging.
      browser.on('status', function (info) {
        console.log(info);
      });
      browser.on('command', function (meth, path, data) {
        console.log(' > ' + meth, path, data || '');
      });
      // Let's init our browser.
      browser.init(config).nodeify(done);
    });

    scenarios(feature.scenarios, function (scenario) {
      steps(scenario.steps, function (step, done) {
        // For every steps, we give reference to our browser.
        new Yadda.Yadda(library, {browser: browser}).yadda(step, done);
      });
    });

    afterEach(function () {
      // Take a screenshot of our app if test fails.
      takeScreenshotOnFailure(this.currentTest);
    });

    after(function (done) {
      // We have finished, tell the `wd` to quit.
      browser.quit().nodeify(done);
    });

  });
});

function takeScreenshotOnFailure (test) {
  if (test.status != 'passed') {
    var path = 'screenshots/' + test.title.replace(/\W+/g, '_').toLowerCase() + '.png';
    browser.takeScreenshot().then(function (data) {
      fs.writeFileSync(path, data, 'base64');
    });
  }
}
