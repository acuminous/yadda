/*
Please note this is just one way to import different libraries per feature
The downsides of this approach are that it pollutes the specification with @libraries
annotations and doesn't support running the same specification with different libraries,
which can be useful if the application under test supports multiple
interfaces (Rest, Web, CLI, etc)
*/

const Yadda = require('yadda');
const { featureFile, scenarios, steps } = Yadda.plugins.nodetest.StepLevelPlugin.init();

new Yadda.FeatureFileSearch('features').each((file) => {
  featureFile(file, (feature) => {
    const libraries = require_feature_libraries(feature);
    const yadda = Yadda.createInstance(libraries);

    scenarios(feature.scenarios, (scenario) => {
      steps(scenario.steps, (step, done) => {
        yadda.run(step, done);
      });
    });
  });
});

function require_feature_libraries(feature) {
  return feature.annotations.libraries.split(', ').reduce(require_library, []);
}

function require_library(libraries, library) {
  return libraries.concat(require(`./lib/${library}-steps`));
}
