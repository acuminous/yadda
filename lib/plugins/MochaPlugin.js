var fs = require('fs');
var TextParser = require('../parsers/TextParser');
var Yadda = require('../Yadda');

module.exports = function(options) {

    var options = options || {};
    var parser = options.parser || new TextParser();
    var mode = options.mode || 'async';

    function feature(name, filename) {

        var yadda = this;

        var runners = {
            async: runAsyncScenario,
            asynchronous: runAsyncScenario,
            sync: runSyncScenario,
            synchronous: runSyncScenario
        };

        describe(name, function() {            
            var text = fs.readFileSync(filename, 'utf8');
            try {
                var scenarios = parser.parse(text);
                runScenarios(scenarios);
            } catch (e) {
                throw new Error(e);
            }                 
        });

        function runScenarios(scenarios) {
            var runner = runners[mode];
            if (!runner) throw 'Unsupported mode: ' + mode; 
            for (var i = 0; i < scenarios.length; i++) {
                runner(scenarios[i]);
            };       
        };      

        function runAsyncScenario(scenario) {
            it(scenario.title, function(done) {
                yadda.yadda(scenario.steps, done);
            });
        };

        function runSyncScenario(scenario) {
            it(scenario.title, function() {
                yadda.yadda(scenario.steps);
            });
        };
    };

    Yadda.prototype.mocha = feature;
    Yadda.prototype.jasmine = feature;
};