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
        if (!options.silenceDeprecations) {
            console.log('*******************************************************************************');
            console.log('* SyncScenarioLevelPlugin has been deprecated and will soon be removed.       *');
            console.log('* Use the ScenarioLevelPlugin instead.                                        *');
            console.log('* To turn off this message add silenceDeprecations: true to the init options. *');
            console.log('*******************************************************************************');
        }
        $(scenarios).each(function(scenario) {
            base_plugin.it_sync(scenario.title, scenario, iterator);
        });
    }

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;
};
