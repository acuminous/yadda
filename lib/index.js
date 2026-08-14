const api = {
  Yadda: require('./Yadda'),
  EventBus: require('./EventBus'),
  Interpreter: require('./Interpreter'),
  Context: require('./Context'),
  ContextBoundLibrary: require('./ContextBoundLibrary'),
  ContextParamLibrary: require('./ContextParamLibrary'),
  // Deprecated alias for ContextBoundLibrary; retained for backwards compatibility.
  Library: require('./ContextBoundLibrary'),
  Dictionary: require('./Dictionary'),
  FeatureFileSearch: require('./FeatureFileSearch'),
  FileSearch: require('./FileSearch'),
  localisation: require('./localisation/index'),
  converters: require('./converters/index'),
  parsers: require('./parsers/index'),
  plugins: require('./plugins/index'),
  createInstance: function () {
    // Not everyone shares my sense of humour re the recursive api :(
    // See https://github.com/acuminous/yadda/issues/111
    return api.Yadda.apply(null, Array.prototype.slice.call(arguments, 0));
  },
};

module.exports = api;
