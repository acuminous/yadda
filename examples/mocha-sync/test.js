var Yadda = require('yadda');
Yadda.plugins.mocha({ mode: 'sync'});

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {
        
        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario) {
            yadda.yadda(scenario.steps);
        });
    });
});