/*
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: false */
"use strict";

module.exports = function(config) {
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