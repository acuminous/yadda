var fs = require('fs');

var Yadda = require('../../lib/index').Yadda;
var CasperPlugin = require('../../lib/index').plugins.CasperPlugin;
var TextParser = require('../../lib/index').parsers.TextParser;

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function runScenario(file, fn) {
    var parser = new TextParser();        
    var text = fs.read(file);
    var scenarios = parser.parse(text);
    if (scenarios.length > 1) throw "Yadda cannot run multiple scenarios using casper";
    fn(scenarios[0]);
};

var library = require('./google-library').init();
var yadda = new Yadda(library);
var casper = new CasperPlugin(yadda).init();

runScenario('./spec/bottles-spec.txt', function(scenario) {
    casper.start();
    casper.test.info(scenario.title);
    casper.yadda(scenario.steps);
    casper.run(function() {
        this.test.done(5);
        this.test.renderResults(true);
    });
});
