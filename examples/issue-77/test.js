var Yadda = require('yadda');
Yadda.plugins.mocha.AsyncStepLevelPlugin.init({language: Yadda.localisation.French});

new Yadda.FeatureFileSearch('features').each(function(file) {
    featureFile(file, function(feature) {

        var library = require('./library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step, done) {
                yadda.yadda(step, done);
            })
        });
    });
});