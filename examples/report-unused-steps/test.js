const { after } = require('node:test');
const Yadda = require('yadda');
const EventBus = Yadda.EventBus;
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

const unused = {};

EventBus.instance()
  .on(EventBus.ON_DEFINE, (event) => {
    unused[event.data.pattern] = event.data.signature;
  })
  .on(EventBus.ON_EXECUTE, (event) => {
    delete unused[event.data.pattern];
  });

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const library = require('./bottles-library');
    const yadda = Yadda.createInstance(library);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, done);
      });
    });
  });
});

after(() => {
  console.log('Unused steps');
  for (const pattern in unused) {
    console.log(pattern);
  }
});
