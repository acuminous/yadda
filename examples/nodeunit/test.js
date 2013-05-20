var fs = require('fs');
var path = require('path');

require('../../src/js/yadda-0.2.2');
require('../../src/js/yadda-0.2.2-localisation');
require('../../src/js/yadda-0.2.2-text-parser.js');

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function eachScenario(dir, fn) {
    var parser = new Yadda.Parsers.TextParser();        
    var scenarios = fs.readdirSync(dir).filter(bySpecification).forEach(function(file) {
        var text = fs.readFileSync(path.join(dir, file), 'utf8');
        var scenarios = parser.parse(text);
        for (var i = 0; i < scenarios.length; i++) {
            fn(scenarios[i]);
        };
    });
};

eachScenario('./spec', function(scenario) {
    var library = require('./bottles-library').create();
    var yadda = new Yadda.yadda(library).after(function() {
        this.done();
    });        
    exports[scenario.title] = function(test) {
        yadda.yadda(scenario.steps, test);
    };
});