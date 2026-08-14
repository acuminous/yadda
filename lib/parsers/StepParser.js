var $ = require('../Array');

var StepParser = function () {
  var NON_BLANK_REGEX = /[^\s]/;

  this.parse = (text, next) => {
    var steps = split(text).find_all(non_blanks);
    return next?.(steps) || steps;
  };

  var split = (text) => $(text.split(/\n/));

  var non_blanks = (text) => text && NON_BLANK_REGEX.test(text);
};

module.exports = StepParser;
