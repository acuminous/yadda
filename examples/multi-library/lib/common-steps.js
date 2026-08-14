const Yadda = require('yadda');
const English = Yadda.localisation.English;
const dictionary = require('./dictionary');
const Wall = require('./Wall');
const assert = require('assert');

module.exports = (function () {
  const library = English.localise(new Yadda.ContextParamLibrary(dictionary));

  // Define common steps here

  return library;
})();
