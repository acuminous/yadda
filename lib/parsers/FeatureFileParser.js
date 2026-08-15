const BaseFileParser = require('./BaseFileParser');
const FeatureParser = require('./FeatureParser');

const FeatureFileParser = function (options) {
  BaseFileParser.call(this, new FeatureParser(options));
};

module.exports = FeatureFileParser;
