var fs = module.client ? undefined : require('fs');
var English = require('../localisation/English');
var FeatureParser = require('../parsers/FeatureParser');
var $ = require('../Array');

module.exports = function(options) {

    var options = options || {};
    var language = options.language || English;
    var parser = options.parser || new FeatureParser(language);
    var target = module.client ? window : GLOBAL;

    function describe_feature_files(filenames, iterator) {
        $(filenames).each(function(filename) {
            var text = fs.readFileSync(filename, 'utf8');
            describe_features(text, iterator);
        });        
    }

    function describe_features(text, iterator) {
        parser.parse(text, function(feature) {
            describe(feature.title, feature, iterator);
        })        
    }

    function describe_scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            describe(scenario.title, scenario, iterator);
        });        
    }

    function describe(title, subject, iterator) {
        var _describe = is_pending(subject) ? GLOBAL.xdescribe : GLOBAL.describe;
        _describe(title, function() {
            iterator(subject)
        });        
    }

    function it_scenarios_async(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            it_async(scenario.title, scenario, iterator);                        
        });        
    }

    function it_scenarios_sync(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            it_sync(scenario.title, scenario, iterator);            
        });        
    }    

    function it_steps_async(steps, iterator) {
        $(steps).each(function(step) {
            it_async(step, step, iterator);
        });
    }

    function it_steps_sync(steps, iterator) {
        $(steps).each(function(step) {
            it_sync(step, step, iterator);
        });         
    }

    function it_async(title, subject, iterator) {
        var _it = is_pending(subject) ? GLOBAL.xit : GLOBAL.it;
        _it(title, function(done) {
            iterator(subject, done);
        })        
    }  

    function it_sync(title, subject, iterator) {
        var _it = is_pending(subject) ? GLOBAL.xit : GLOBAL.it;
        _it(title, function() {
            iterator(subject);
        })        
    }      

    function is_pending(subject) {
        return subject.annotations && subject.annotations[language.localise('pending')];
    }

    function is_verbose() {
        return options.output == 'verbose';
    }

    function is_sync() {
        return options.mode == 'sync';
    }        

    function configure(target) {
        target.features = target.feature = fs ? describe_feature_files : describe_features;
        if (is_verbose()) {
            target.scenarios = describe_scenarios;
            target.steps = is_sync() ? it_steps_sync : it_steps_async;
        } else {
            target.scenarios = is_sync() ? it_scenarios_sync : it_scenarios_async;
        }
    }
     
    configure(target);
};
