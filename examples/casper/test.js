// The following code requires casper 1.1 after the following commit 
// https://github.com/n1k0/casperjs/commit/2378537a716a492533a279b8e3bc560ae3deca5a

var fs = require('fs');
var async = require('async');
var casper = require('casper').create();

// var Yadda = require('yadda');
var Yadda = require('../../lib/index.js');

var TextParser = Yadda.parsers.TextParser;
var Dictionary = Yadda.Dictionary;
var Library = Yadda.localisation.English;

var library = require('./google-library').init();
var yadda = new Yadda.Yadda(library);
Yadda.plugins.casper(yadda, casper);

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function loadScenarios(file) {
    var parser = new TextParser();
    var text = fs.read(file);
    return parser.parse(text);
};

var scenarios = loadScenarios('./spec/bottles-spec.txt');
async.eachSeries(scenarios, function(scenario, next) {
    casper.start();
    casper.test.info(scenario.title);
    casper.yadda(scenario.steps);
    casper.run(function() {
        next();
    });
}, function(err) {
    casper.test.done();
    casper.test.renderResults(true);
});
