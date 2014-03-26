(function() {

    var Yadda = require('yadda'),
        English = Yadda.localisation.English,
        FeatureParser = Yadda.parsers.FeatureParser,
        parser = new FeatureParser(English),
        bottles = require('yadda-component-browser-example/features/bottles.feature.js'),
        steps = require('yadda-component-browser-example/bottles-library.js'),
        steps = new Yadda.Yadda(steps),
        steps = steps.yadda.bind(steps);

    mocha.setup('bdd');
    Yadda.plugins.mocha();

    feature(bottles, function(feature) {
        scenarios(feature.scenarios, function(scenario, done) {
            steps(scenario.steps, done);
        });
    });
})();
