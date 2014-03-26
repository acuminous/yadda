var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    var platform = new Platform();
    var options = options || {};
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.describe(scenario.title, scenario, iterator);
        });
    }

    function steps(steps, iterator) {
        var abort;
        $(steps).each(function(step) {
            console.log(step);
            base_plugin.it_sync(step, step, function(step) {
                if (abort) return;
                abort = true;
                iterator(step);
                abort = false;
            });
        });
    }

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;
    container.steps = steps;
};
