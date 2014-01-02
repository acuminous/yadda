var Yadda = require('yadda');
Yadda.plugins.jasmine();

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {

        var library = require('../bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario, done) {
            yadda.yadda(scenario.steps, done);
        });
    });
});