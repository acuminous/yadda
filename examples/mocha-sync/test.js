var Yadda = require('yadda');
Yadda.plugins.mocha({ mode: 'sync'});

var all_features = new Yadda.FileSearch('features').list();

features(all_features, function(feature) {

    var library = require('./bottles-library');
    var yadda = new Yadda.Yadda(library);

    scenarios(feature.scenarios, function(scenario) {
        yadda.yadda(scenario.steps);
    });
});