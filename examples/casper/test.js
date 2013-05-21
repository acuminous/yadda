var fs = require('fs');
var async = require('async');
var casper = require('casper').create();

// Still looking for an elegant way to require Yadda modules.
// See https://groups.google.com/forum/?fromgroups#!searchin/casperjs/Yadda/casperjs/ag6ajk5WAag/172BAEV-Xm4J
function initYadda() {
    // Using browserify overwrites Casper's require method
    var oldRequire = require;
    phantom.injectJs('../../dist/yadda-0.3.0.js');
    window.Yadda = require('Yadda');
    window.CasperPlugin = require('plugins').CasperPlugin;
    window.Library = require('localisation').English;
    window.TextParser = require('parsers').TextParser;
    window.Dictionary = require('Dictionary');
    window.library = require('./google-library').init();
    window.yadda = new Yadda(library);
    window.require = oldRequire;
};

function bySpecification(file) {
    return file.substr(-9) === '-spec.txt';
};

function loadScenarios(file) {
    var parser = new TextParser();        
    var text = fs.read(file);
    return parser.parse(text);
};

initYadda();
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
