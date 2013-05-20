var fs = require('fs');

require('../../src/js/yadda-0.2.2');
require('../../src/js/yadda-0.2.2-localisation');
require('../../src/js/yadda-0.2.2-text-parser.js');

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function runScenario(file, fn) {
    var parser = new Yadda.Parsers.TextParser();        
    var text = fs.read(file);
    var scenarios = parser.parse(text);
    if (scenarios.length > 1) throw "Yadda cannot run multiple scenarios using casper";
    fn(scenarios[0]);
};

var library = require('./google-library').create();
var yadda = new Yadda.yadda(library);
var casper = require('../../src/js/yadda-0.2.2-casper').create(yadda);

runScenario('./spec/bottles-spec.txt', function(scenario) {
    casper.start();
    casper.test.info(scenario.title);
    casper.yadda(scenario.steps);
    casper.run(function() {
        this.test.done(5);
        this.test.renderResults(true);
    });
});
