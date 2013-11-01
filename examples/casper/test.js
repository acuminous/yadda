// The following code requires casper 1.1 after the following commit
// https://github.com/n1k0/casperjs/commit/2378537a716a492533a279b8e3bc560ae3deca5a

var fs = require('fs');
var async = require('async');
var Yadda = require('yadda');

var Dictionary = Yadda.Dictionary;
var English = Yadda.localisation.English;

var library = require('./google-library').init();
var yadda = new Yadda.Yadda(library);
Yadda.plugins.casper(yadda, casper);

var parser = new Yadda.parsers.FeatureParser();


new Yadda.FileSearch('features').list().forEach(function(filename) {

    var feature = parser.parse(fs.read(filename));

    casper.test.begin(feature.title, function suite(test) {
        async.eachSeries(feature.scenarios, function(scenario, next) {
            casper.start();
            casper.test.info(scenario.title);
            casper.yadda(scenario.steps);
            casper.run(function() {
                next();
            });
        }, function(err) {
            casper.test.done();
        });
    });

})