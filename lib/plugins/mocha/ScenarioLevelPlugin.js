var $ = require('../../Array');
var BasePlugin = require('./BasePlugin');

module.exports.init = function (options) {
  var options = options || {};
  var container = options.container || global;

  var base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each(function (scenario) {
      var itFn = iterator.length === 1 ? base_plugin.it_sync : base_plugin.it_async;
      itFn(scenario.title, scenario, function (context, scenario, done) {
        iterator(scenario, done);
      });
    });
  }

  container.featureFiles = container.featureFile = base_plugin.featureFiles;
  container.features = container.feature = base_plugin.features;
  container.rules = container.rule = base_plugin.rules;
  container.scenarios = container.scenario = scenarios;
};
