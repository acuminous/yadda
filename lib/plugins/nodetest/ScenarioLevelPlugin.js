const $ = require('../../Array');
const BasePlugin = require('./BasePlugin');

module.exports.init = (options = {}) => {
  const base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each((scenario) => {
      const itFn = iterator.length === 1 ? base_plugin.it_sync : base_plugin.it_async;
      itFn(scenario.title, scenario, (_t, scenario, done) => {
        iterator(scenario, done);
      });
    });
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
  };
};
