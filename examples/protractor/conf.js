/* globals jasmine */
/* jslint node: true */
"use strict";

exports.config = {
    framework: 'jasmine2',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['spec/google-spec.js'],
    capabilities: {'browserName': 'chrome'},
    directConnect: false,
    jasmineNodeOpts: {
        isVerbose: false,
        showColors: true,
        includeStackTrace: true,
        defaultTimeoutInterval: 30000,
       print: function() {}
    },
    onPrepare: function() {
      var SpecReporter = require('jasmine-spec-reporter');
      jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: true}));
    }
};