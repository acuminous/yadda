const $ = require('../Array');

const StepParser = function () {
  const NON_BLANK_REGEX = /[^\s]/;

  this.parse = (text, next) => {
    const steps = split(text).find_all(non_blanks);
    return next?.(steps) || steps;
  };

  const split = (text) => $(text.split(/\n/));

  const non_blanks = (text) => text && NON_BLANK_REGEX.test(text);
};

module.exports = StepParser;
