const $ = require('../../Array');
const BasePlugin = require('./BasePlugin');

module.exports.init = (options = {}) => {
  const container = options.container || global;

  const base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each((scenario) => {
      base_plugin.describe(scenario.title, scenario, iterator);
    });
  }

  function steps(steps, iterator) {
    let abort = false;

    $(steps).each((step) => {
      const stepFn = iterator.length === 1 ? step_sync : step_async;
      stepFn(step, iterator);
    });

    function step_async(step, iterator) {
      base_plugin.it_async(step, step, (context, step, done) => {
        if (abort) {
          return context.skip ? context.skip() : done();
        }
        abort = true;
        iterator(runnable(context, step), (err) => {
          if (err) return (done.fail || done)(err);
          abort = false;
          done();
        });
      });
    }

    function step_sync(step, iterator) {
      base_plugin.it_sync(step, step, (context, step) => {
        if (abort) return context.skip && context.skip();
        abort = true;
        iterator(runnable(context, step));
        abort = false;
      });
    }
  }

  function runnable(context, step) {
    return {
      name: step,
      skip(message) {
        context.skip(message);
      },
    };
  }

  container.featureFiles = container.featureFile = base_plugin.featureFiles;
  container.features = container.feature = base_plugin.features;
  container.rules = container.rule = base_plugin.rules;
  container.scenarios = container.scenario = scenarios;
  container.steps = steps;
};
