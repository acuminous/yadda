var Yadda = require('yadda');
Yadda.plugins.jasmine({ output: 'verbose'});

new Yadda.FeatureFileSearch('features').each(function(file) {
    features(file, function(feature) {
        
        var library = require('../bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario, done) {
            steps(scenario.steps, function(step, done) {
                yadda.yadda(scenario.steps, done);
            })
        });
    });
});