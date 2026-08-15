const Yadda = require('yadda');
const { MarkdownFeatureFileParser } = Yadda.parsers;
const { featureFile, rules, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init({ parser: new MarkdownFeatureFileParser() });

const markdownFeatures = new Yadda.FileSearch(['features'], /.*\.feature\.md$/);

markdownFeatures.each((file) => {
  featureFile(file, (feature) => {
    const yadda = Yadda.createInstance(require('./library'));

    runScenarios(feature.scenarios);
    rules(feature.rules, (rule) => runScenarios(rule.scenarios));

    function runScenarios(list) {
      scenarios(list, (scenario) => {
        steps(scenario.steps, (step) => {
          yadda.run(step);
        });
      });
    }
  });
});
