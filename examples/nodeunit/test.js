var fs = require('fs');
var Yadda = require('../../lib/index');
var parser = new Yadda.parsers.FeatureParser();
var library = require('./bottles-library');
var yadda = new Yadda.Yadda(library);

new Yadda.FileSearch('features').each(function(filename) {
    var text = fs.readFileSync(filename, 'utf8');
    var feature = parser.parse(text);
    feature.scenarios.forEach(function(scenario) {
        exports[scenario.title] = function(test) {
            yadda.yadda(scenario.steps, { test: test }, test.done);
        };
    }); 
});