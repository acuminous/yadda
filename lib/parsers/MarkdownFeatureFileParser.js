const BaseFileParser = require('./BaseFileParser');
const MarkdownFeatureParser = require('./MarkdownFeatureParser');

const MarkdownFeatureFileParser = function (options) {
  BaseFileParser.call(this, new MarkdownFeatureParser(options));
};

module.exports = MarkdownFeatureFileParser;
