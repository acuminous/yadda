"use strict";

var FeatureFileParser = function(options) {

    var fs = require('../shims').fs;
    var FeatureParser = require('./FeatureParser');
    var parser = new FeatureParser(options);

    this.parse = function(file, next) {
        var text = fs.readFileSync(file, 'utf8');
        var feature = parser.parse(text);
        return next && next(feature) || feature;
    };
};

module.exports = FeatureFileParser;
