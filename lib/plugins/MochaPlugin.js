var fs = require('fs');
var English = require('../localisation/English');
var FeatureParser = require('../parsers/FeatureParser');

module.exports = function(options) {

    var options = options || {};
    var language = options.language || English;
    var parser = options.parser || new FeatureParser(language);
    var mode = options.mode || 'async';

    function feature(filename, next) {
        var text = fs.readFileSync(filename, 'utf8');
        parser.parse(text, function(feature) {
            var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
            _describe(feature.title[0] || filename, function() {
                next(feature)
            });
        });
    };

    function async_scenarios(scenarios, next) {
        scenarios.forEach(function(scenario) {
            var _it = scenario.annotations.Pending ? xit : it;
            _it(scenario.title[0], function(done) {
                next(scenario, done)
            });
        });
    };

    function sync_scenarios(scenarios, next) {
        scenarios.forEach(function(scenario) {
            var _it = scenario.annotations.Pending ? xit : it;
            _it(scenario.title[0], function() {
                next(scenario)
            });
        });
    };

    GLOBAL.feature = feature;
    GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
};