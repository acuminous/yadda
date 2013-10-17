var fs = require('fs');
var path = require('path');

var Yadda = require('../../lib/Yadda');
var FeatureParser = require('../../lib/parsers/FeatureParser');

function bySpecification(file) {
    return file.substr(-8) === '.feature';
};

function eachScenario(dir, fn) {
    var parser = new FeatureParser();
    var scenarios = fs.readdirSync(dir).filter(bySpecification).forEach(function(file) {
        var text = fs.readFileSync(path.join(dir, file), 'utf8');
        var scenarios = parser.parse(text).scenarios;
        for (var i = 0; i < scenarios.length; i++) {
            fn(scenarios[i]);
        };
    });
};

eachScenario('./features', function(scenario) {
    var library = require('./bottles-library');
    var yadda = new Yadda(library);
    exports[scenario.title] = function(test) {
        yadda.yadda(scenario.steps, { test: test }, test.done);
    };
});