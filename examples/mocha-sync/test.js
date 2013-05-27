var fs = require('fs');
var path = require('path');
var assert = require("assert")

var Yadda = require('../../lib/Yadda');
var TextParser = require('../../lib/parsers/TextParser');

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function eachScenario(dir, fn) {
    var parser = new TextParser();        
    var scenarios = fs.readdirSync(dir).filter(bySpecification).forEach(function(file) {
        var text = fs.readFileSync(path.join(dir, file), 'utf8');
        var scenarios = parser.parse(text);
        for (var i = 0; i < scenarios.length; i++) {
            fn(scenarios[i]);
        };
    });
};

describe('Bottles', function() {
    eachScenario('./spec', function(scenario) {

        var library = require('./bottles-library').init();
        var yadda = new Yadda(library);        

        it(scenario.title, function() {
            yadda.yadda(scenario.steps, { assert: assert} );
        });
    });
})
