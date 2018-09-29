"use strict";

var Library = require('../Library');
var $ = require('../Array');

module.exports = function(name, vocabulary) {

    var _this = this;

    // See http://github.com/acuminous/yadda#203
    this.is_language = true;

    this.library = function(dictionary) {
        return _this.localise_library(new Library(dictionary));
    };

    this.localise_library = function(library) {
        $(vocabulary._steps).each(function(keyword) {
            library[keyword] = function(signatures, fn, ctx, options) {
                return $(signatures).each(function(signature) {
                    signature = prefix_signature(_this.localise(keyword), signature);
                    return library.define(signature, fn, ctx, options);
                });
            };
        });
        return library;
    };

    var prefix_signature = function(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        var one_or_more_spaces = '\\s+';
        var leading_spaces = '^(?:\\s)*';
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, leading_spaces + prefix + one_or_more_spaces);
    };

    this.localise = function(keyword) {
        if (vocabulary[keyword] === undefined) throw new Error('Keyword "' + keyword + '" has not been translated into ' + name + '.');
        return vocabulary[keyword];
    };
};
