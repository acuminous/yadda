var Yadda = require('yadda');
Yadda.plugins.mocha({language: Yadda.localisation.Pirate});

var all_features = new Yadda.FileSearch('features').list();

feature(all_features, function(feature) {

    var library = require('./bottles-library');
    var yadda = new Yadda.Yadda(library);

    scenarios(feature.scenarios, function(scenario, done) {
        yadda.yadda(scenario.steps, done);
    });
});