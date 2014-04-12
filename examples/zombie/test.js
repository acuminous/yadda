var Yadda = require('yadda');
Yadda.plugins.mocha();

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {

        var library = require('./google-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario, done) {
            yadda.yadda(scenario.steps, done);
        });
    });
});
