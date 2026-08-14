const $ = require('./Array');

// Wrapper for JavaScript Regular Expressions
const RegularExpression = function (pattern_or_regexp) {
  const groups_pattern = /(^|[^\\\\])\(.*?\)/g;
  const sets_pattern = /(^|[^\\\\])\[.*?\]/g;
  const repetitions_pattern = /(^|[^\\\\])\{.*?\}/g;
  const regex_aliases_pattern = /(^|[^\\\\])\\./g;
  const non_word_tokens_pattern = /[^\w\s]/g;
  const regexp = new RegExp(pattern_or_regexp);

  this.test = function (text) {
    const result = regexp.test(text);
    this.reset();
    return result;
  };

  this.groups = function (text) {
    const results = $();
    let match = regexp.exec(text);
    while (match) {
      const groups = match.slice(1, match.length);
      results.push(groups);
      match = regexp.global && regexp.exec(text);
    }
    this.reset();
    return results.flatten();
  };

  this.reset = function () {
    regexp.lastIndex = 0;
    return this;
  };

  this.without_expressions = () => regexp.source.replace(groups_pattern, '$1').replace(sets_pattern, '$1').replace(repetitions_pattern, '$1').replace(regex_aliases_pattern, '$1').replace(non_word_tokens_pattern, '');

  this.equals = function (other) {
    return this.toString() === other.toString();
  };

  this.toString = () => `/${regexp.source}/`;
};

module.exports = RegularExpression;
