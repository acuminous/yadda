const $ = require('../Array');
const ContextBoundLibrary = require('../ContextBoundLibrary');

module.exports = function (name, vocabulary) {
  // See http://github.com/acuminous/yadda#203
  this.is_language = true;

  this.localise = (library) => {
    $(vocabulary._steps).each((keyword) => {
      library[keyword] = (signatures, fn, ctx, options) =>
        $(signatures).each((signature) => {
          signature = prefix_signature(this.translate(keyword), signature);
          return library.define(signature, fn, ctx, options);
        });
    });
    return library;
  };

  // Deprecated: constructs a context-bound library. Prefer
  // localise(new ContextParamLibrary(dictionary)) for arrow-friendly steps.
  this.library = (dictionary) => {
    process.emitWarning('Language.library() is deprecated; prefer localise(new ContextParamLibrary(dictionary)) for arrow-friendly steps, or localise(new ContextBoundLibrary(dictionary)) to keep this-bound steps.', 'DeprecationWarning');
    return this.localise(new ContextBoundLibrary(dictionary));
  };

  const prefix_signature = (prefix, signature) => {
    const regex_delimiters = /^\/|\/$/g;
    const start_of_signature = new RegExp(/^(?:\^)?/);
    const one_or_more_spaces = '\\s+';
    const leading_spaces = '^(?:\\s)*';
    return signature
      .toString()
      .replace(regex_delimiters, '')
      .replace(start_of_signature, leading_spaces + prefix + one_or_more_spaces);
  };

  this.translate = (keyword) => {
    if (vocabulary[keyword] === undefined) throw new Error(`Keyword "${keyword}" has not been translated into ${name}.`);
    return vocabulary[keyword];
  };

  this.supports = (keyword) => vocabulary[keyword] !== undefined;
};
