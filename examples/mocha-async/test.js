var Yadda = require('yadda');
Yadda.plugins.mocha();

new Yadda.FeatureFileSearch('features').each(function(file) {
    feature(file, function(feature) {

        var library = require('./bottles-library');
        var yadda = new Yadda.Yadda(library);

        scenarios(feature.scenarios, function(scenario, done) {            
            yadda.yadda(feature.background_steps.concat(scenario.steps), done);
        });
    });
});