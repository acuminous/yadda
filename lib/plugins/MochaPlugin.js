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
 
/* jslint node: true */
/* jslint browser: true */
/* global describe, xdescribe, it, xit */
"use strict";

if (!module.client) {
    var fs = require('fs');
}
var English = require('../localisation/English');
var FeatureParser = require('../parsers/FeatureParser');
var $ = require('../Array');

module.exports = function(options) {

    /* jslint shadow: true */
    var options = options || {};
    var language = options.language || English;
    var parser = options.parser || new FeatureParser(language);
    var mode = options.mode || 'async';
    var feature;

    if (options.deprecation_warning !== false) {
        console.log('The MochaPlugin is deprecated as of 0.10.0 and will be removed in 0.12.0');
        console.log('Replace it with one of AsyncScenarioLevelPlugin, SyncScenarioLevelPlugin, AsyncStepLevelPlugin or SyncStepLevelPlugin');
        console.log('To disable this message use Yadda.plugins.mocha({deprecation_warning: false})');
        console.log('See the readme for more details');
    }

    if (module.client) {
        feature = function (text, next) {
            parser.parse(text, function(feature) {
                var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
                _describe(feature.title, function() {
                    next(feature);
                });
            });
        };
    } else {
        feature = function (filenames, next) {
            $(filenames).each(function(filename) {
                var text = fs.readFileSync(filename, 'utf8');
                parser.parse(text, function(feature) {
                    var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
                    _describe(feature.title || filename, function() {
                        next(feature);
                    });
                });
            });
        };
    }

    function async_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function(done) {
                next(scenario, done);
            });
        });
    }

    function sync_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function() {
                next(scenario);
            });
        });
    }

    if (typeof GLOBAL !== 'undefined') {
        GLOBAL.features = GLOBAL.feature = feature;
        GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
    }

    if (typeof window !== 'undefined') {
        window.features = window.feature = feature;
        window.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
    }
};
