// Casper support is currently broken in Yadda 0.3.0. I'm not sure how to get imports working in PhantomJS

var fs = require('fs');

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
