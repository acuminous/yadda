var English = require('../../localisation/English');
var Platform = require('../../Platform');
var FeatureFileParser = require('../../parsers/FeatureFileParser');
var $ = require('../../Array');

module.exports.create = function(options) {

    var platform = new Platform();
    var language = options.language || English;
    var parser = options.parser || new FeatureFileParser(language);
    var container = options.container || platform.get_container();

    function featureFiles(files, iterator) {
        $(files).each(function(file) {
            features(parser.parse(file), iterator);
        });
    };

    function features(features, iterator) {
        $(features).each(function(feature) {
            describe(feature.title, feature, iterator);
        });
    };

    function describe(title, subject, iterator) {
        var _describe = is_pending(subject) ?
            container.xdescribe : container.describe;
        _describe(title, function() {
            iterator(subject);
        });
    }

    function it_async(title, subject, iterator) {
        var _it = is_pending(subject) ? container.xit : container.it;
        _it(title, function(done) {
            iterator(subject, done);
        });
    }

    function it_sync(title, subject, iterator) {
        var _it = is_pending(subject) ? container.xit : container.it;
        _it(title, function() {
            iterator(subject);
        });
    }

    function is_pending(subject) {
        var regexp = new RegExp('^' + language.localise('pending') + '$');
        for (var key in subject.annotations) {
            if (regexp.test(key)) return true;
        }
    }

    return {
        featureFiles: featureFiles,
        features: features,
        describe: describe,
        it_async: it_async,
        it_sync: it_sync
    };
};
