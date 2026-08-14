var $ = require('../../Array');
var BasePlugin = require('./BasePlugin');

module.exports.init = (options) => {
  var options = options || {};
  var container = options.container || global;

  var base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each((scenario) => {
      base_plugin.describe(scenario.title, scenario, iterator);
    });
  }

  function steps(steps, iterator) {
    var abort = false;

    $(steps).each((step) => {
      var stepFn = iterator.length === 1 ? step_sync : step_async;
      stepFn(step, iterator);
    });

    function step_async(step, iterator) {
      base_plugin.it_async(step, step, (context, step, done) => {
        if (abort) {
          return context.skip ? context.skip() : done();
        }
        abort = true;
        iterator.bind(context)(step, (err) => {
          if (err) return (done.fail || done)(err);
          abort = false;
          done();
        });
      });
    }

    function step_sync(step, iterator) {
      base_plugin.it_sync(step, step, (context, step) => {
        if (abort) return context.skip?.();
        abort = true;
        iterator.bind(context)(step);
        abort = false;
      });
    }
  }

  container.featureFiles = container.featureFile = base_plugin.featureFiles;
  container.features = container.feature = base_plugin.features;
  container.rules = container.rule = base_plugin.rules;
  container.scenarios = container.scenario = scenarios;
  container.steps = steps;
};
