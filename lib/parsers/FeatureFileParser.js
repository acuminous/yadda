var FeatureFileParser = function(language) {

    // Requiring fs locally so it doesn't break component
    var fs = require('fs');
    var FeatureParser = require('./FeatureParser');
    var parser = new FeatureParser(language);

    this.parse = function(file, next) {
        var text = fs.readFileSync(file, 'utf8');
        var feature = parser.parse(text);
        return next && next(feature) || feature;
    };
};

module.exports = FeatureFileParser;
