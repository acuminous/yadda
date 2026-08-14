var Library = require('../Library');
var $ = require('../Array');

module.exports = function (name, vocabulary) {
  // See http://github.com/acuminous/yadda#203
  this.is_language = true;

  this.library = (dictionary) => this.localise_library(new Library(dictionary));

  this.localise_library = (library) => {
    $(vocabulary._steps).each((keyword) => {
      library[keyword] = (signatures, fn, ctx, options) =>
        $(signatures).each((signature) => {
          signature = prefix_signature(this.localise(keyword), signature);
          return library.define(signature, fn, ctx, options);
        });
    });
    return library;
  };

  var prefix_signature = (prefix, signature) => {
    var regex_delimiters = /^\/|\/$/g;
    var start_of_signature = new RegExp(/^(?:\^)?/);
    var one_or_more_spaces = '\\s+';
    var leading_spaces = '^(?:\\s)*';
    return signature
      .toString()
      .replace(regex_delimiters, '')
      .replace(start_of_signature, leading_spaces + prefix + one_or_more_spaces);
  };

  this.localise = (keyword) => {
    if (vocabulary[keyword] === undefined) throw new Error(`Keyword "${keyword}" has not been translated into ${name}.`);
    return vocabulary[keyword];
  };

  this.supports = (keyword) => vocabulary[keyword] !== undefined;
};
