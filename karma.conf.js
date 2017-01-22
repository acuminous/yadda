
/* jslint node: false */

module.exports = function(config) {
    "use strict";
    config.set({
        plugins: [
            "karma-browserify",
            "karma-phantomjs-launcher",
            "karma-mocha"
        ],
        frameworks: ["browserify", "mocha"],
        files: [
            "lib/**/*.js",
            {pattern: "lib/**/!(*.js)", included: false},
            "test/**/*.js",
            {pattern: "test/**/!(*.js)", included: false}
        ],
        preprocessors: {
            "lib/**/*.js": ["browserify"],
            "test/**/*.js": ["browserify"]
        },
        client: {
            mocha: {
                reporter: "html",
                ui: "bdd"
            }
        },
        browserify: {
            debug: true,
            configure: function (bundle) {
                bundle.on('prebundle', function () {
                    bundle.require("./lib/index", {expose: "yadda"});
                });
            }
        },
        browsers: ["PhantomJS"],
        reporters: ["progress"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        captureTimeout: 6000,
        singleRun: true
    });
};
