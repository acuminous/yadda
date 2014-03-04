var Yadda = require('yadda');
Yadda.plugins.mocha({ mode: 'sync', output: 'verbose' });

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {
        
        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            steps(scenario.steps, function(step) {
                yadda.yadda(step);
            })
        });
    });
});