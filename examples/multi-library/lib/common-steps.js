var Yadda = require('yadda');
var English = Yadda.localisation.English;
var dictionary = require('./dictionary');
var Wall = require('./Wall');
var assert = require('assert');

module.exports = (function () {
  var library = English.localise(new Yadda.ContextBoundLibrary(dictionary));

  // Define common steps here

  return library;
})();
