"use strict";

var $ = require('./Array');

// Wrapper for JavaScript Regular Expressions
var RegularExpression = function(pattern_or_regexp) {

    var groups_pattern = /(^|[^\\\\])\(.*?\)/g;
    var sets_pattern = /(^|[^\\\\])\[.*?\]/g;
    var repetitions_pattern = /(^|[^\\\\])\{.*?\}/g;
    var regex_aliases_pattern = /(^|[^\\\\])\\./g;
    var non_word_tokens_pattern = /[^\w\s]/g;
    var regexp = new RegExp(pattern_or_regexp);

    this.test = function(text) {
        var result = regexp.test(text);
        this.reset();
        return result;
    };

    this.groups = function(text) {
        var results = $();
        var match = regexp.exec(text);
        while (match) {
            var groups = match.slice(1, match.length);
            results.push(groups);
            match = regexp.global && regexp.exec(text);
        }
        this.reset();
        return results.flatten();
    };

    this.reset = function() {
        regexp.lastIndex = 0;
        return this;
    };

    this.without_expressions = function() {
        return regexp.source.replace(groups_pattern, '$1')
                            .replace(sets_pattern, '$1')
                            .replace(repetitions_pattern, '$1')
                            .replace(regex_aliases_pattern, '$1')
                            .replace(non_word_tokens_pattern, '');
    };

    this.equals = function(other) {
        return this.toString() === other.toString();
    };

    this.toString = function() {
        return "/" + regexp.source + "/";
    };
};

module.exports = RegularExpression;
