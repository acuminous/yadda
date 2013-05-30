var fs = require('fs');
var async = require('async');
var casper = require('casper').create();

// Still looking for an elegant way to require Yadda modules.
// See https://groups.google.com/forum/?fromgroups#!searchin/casperjs/Yadda/casperjs/ag6ajk5WAag/172BAEV-Xm4J
function initYadda() {
    // Using browserify overwrites Casper's require method
    var oldRequire = require;
    phantom.injectJs('../../dist/yadda-0.4.2.js');
    window.Yadda = require('yadda').Yadda;
    window.CasperPlugin = require('yadda').plugins.CasperPlugin;
    window.Library = require('yadda').localisation.English;
    window.TextParser = require('yadda').parsers.TextParser;
    window.Dictionary = require('yadda').Dictionary;
    window.require = oldRequire;
    var library = require('./google-library').init();    
    return new Yadda(library);
};

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function loadScenarios(file) {
    var parser = new TextParser();        
    var text = fs.read(file);
    return parser.parse(text);
};

var yadda = initYadda();
casper = new CasperPlugin(yadda, casper).init();
var scenarios = loadScenarios('./spec/bottles-spec.txt');
async.eachSeries(scenarios, function(scenario, next) {
    casper.start();
    casper.test.info(scenario.title);
    casper.yadda(scenario.steps);    
    casper.run(function() {
        next();
    });
}, function(err) {
    casper.test.done(10);
    casper.test.renderResults(true);
});
