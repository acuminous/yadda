var fs = require('fs');
var async = require('async');
var casper = require('casper').create();

// Still looking for an elegant way to require Yadda modules.
// See https://groups.google.com/forum/?fromgroups#!searchin/casperjs/Yadda/casperjs/ag6ajk5WAag/172BAEV-Xm4J
(function() {
    // Using browserify overwrites Casper's require method
    var oldRequire = require;
    phantom.injectJs('../../dist/yadda-0.4.5.js');

    window.Yadda = require('yadda').Yadda;
    window.Library = require('yadda').localisation.English;
    window.TextParser = require('yadda').parsers.TextParser;
    window.Dictionary = require('yadda').Dictionary;

    var library = require('./google-library').init();
    var yadda = new Yadda(library);
    require('yadda').plugins.casper(yadda, casper);

    window.require = oldRequire;
})();

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
    casper.test.done(10);
    casper.test.renderResults(true);
});
