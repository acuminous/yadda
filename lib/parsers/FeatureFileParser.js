var FeatureFileParser = function (options) {
  var fs = require('node:fs');
  var FeatureParser = require('./FeatureParser');
  var parser = new FeatureParser(options);

  this.parse = (file, next) => {
    var text = fs.readFileSync(file, 'utf8');
    var feature = parser.parse(text);
    return next?.(feature) || feature;
  };
};

module.exports = FeatureFileParser;
