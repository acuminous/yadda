"use strict";

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    // eslint-disable-next-line no-redeclare
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
            var stepFn = iterator.length === 1 ? step_sync : step_async;
            stepFn(step, iterator);
        });

        function step_async(step, iterator) {
            base_plugin.it_async(step, step, function(context, step, done) {
                if (abort) {
                    return context.skip ? context.skip() : done();
                }
                abort = true;
                iterator.bind(context)(step, function(err) {
                    if (err) return (done.fail || done)(err);
                    abort = false;
                    done();
                });
            });
        }

        function step_sync(step, iterator) {
            base_plugin.it_sync(step, step, function(context, step) {
                if (abort) return context.skip && context.skip();
                abort = true;
                iterator.bind(context)(step);
                abort = false;
            });
        }
    }

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;
    container.steps = steps;
};
