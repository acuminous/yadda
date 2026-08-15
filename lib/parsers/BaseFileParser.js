const fs = require('node:fs');

// Understands reading a specification from a file and delegating to a parser
const BaseFileParser = function (parser) {
  this.parse = (file, next) => {
    const text = fs.readFileSync(file, 'utf8');
    const feature = parser.parse(text);
    return next?.(feature) || feature;
  };
};

module.exports = BaseFileParser;
