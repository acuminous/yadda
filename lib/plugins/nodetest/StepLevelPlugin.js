const $ = require('../../Array');
const BasePlugin = require('./BasePlugin');

// node:test's t.skip() marks the test skipped but does not throw, so unlike
// mocha a runtime skip would not abort the rest of the scenario. The runnable
// passed to each step throws this sentinel from skip() so the plugin can stop
// running the remaining steps.
const SKIP = Symbol('yadda.nodetest.skip');

module.exports.init = (options = {}) => {
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
      base_plugin.it_async(step, step, (t, step, done) => {
        if (abort) {
          t.skip();
          return done();
        }
        abort = true;
        try {
          iterator(runnable(t, step), (err) => {
            if (err === SKIP) return done();
            if (err) return done(err);
            abort = false;
            done();
          });
        } catch (err) {
          if (err === SKIP) return done();
          throw err;
        }
      });
    }

    function step_sync(step, iterator) {
      base_plugin.it_sync(step, step, (t, step) => {
        if (abort) return t.skip();
        abort = true;
        try {
          iterator(runnable(t, step));
        } catch (err) {
          if (err === SKIP) return;
          throw err;
        }
        abort = false;
      });
    }
  }

  function runnable(t, step) {
    return {
      name: step,
      test: t,
      skip(message) {
        t.skip(message);
        throw SKIP;
      },
    };
  }

  return {
    featureFiles: base_plugin.featureFiles,
    featureFile: base_plugin.featureFiles,
    features: base_plugin.features,
    feature: base_plugin.features,
    rules: base_plugin.rules,
    rule: base_plugin.rules,
    scenarios: scenarios,
    scenario: scenarios,
    steps: steps,
  };
};
