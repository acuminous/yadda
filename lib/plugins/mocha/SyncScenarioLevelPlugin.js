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

var $ = require('../../Array');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(container, options) {

    var base_plugin = BasePlugin.create(container, options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.it_async(scenario.title, scenario, iterator);
        });
    }

    container.featureFiles = container.featureFile = base_plugins.featureFiles;
    container.features = container.feature = base_plugins.features;
    container.scenarios = conatiner.scenario = scenarios;     
};