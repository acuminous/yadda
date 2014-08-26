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
"use strict";

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    /* jslint shadow: true */
    var options = options || {};
    var platform = new Platform();
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.describe(scenario.title, scenario, iterator);
        });
    }

    function steps(steps, iterator) {

        var abort = false;

        $(steps).each(function(step) {
            var stepFn = iterator.length == 1 ? step_sync : step_async;
            stepFn(step, iterator);
        });

        function step_async(step, iterator) {
            base_plugin.it_async(step, step, function(step, done) {
                if (abort) return done();
                abort = true;
                iterator(step, function(err) {
                    if (err) return done(err);
                    abort = false;
                    done();
                });
            });
        }

        function step_sync(step, iterator) {
            base_plugin.it_sync(step, step, function(step) {
                if (abort) return;
                abort = true;
                iterator(step);
                abort = false;
            });
        }
    }

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;
    container.steps = steps;
};
