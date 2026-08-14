const FeatureFileParser = function (options) {
  const fs = require('node:fs');
  const FeatureParser = require('./FeatureParser');
  const parser = new FeatureParser(options);

  this.parse = (file, next) => {
    const text = fs.readFileSync(file, 'utf8');
    const feature = parser.parse(text);
    return next?.(feature) || feature;
  };
};

module.exports = FeatureFileParser;
