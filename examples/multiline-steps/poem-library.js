const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const parse = require('csv-parse');
const assert = require('assert');

module.exports = (function () {
  let poem;
  const dictionary = new Dictionary().define('NUM', /(\d+)/, Yadda.converters.integer).define('poem', /([^\u0000]*)/);

  const library = English.localise(new Yadda.ContextParamLibrary(dictionary))

    .define('Good Times\n$poem', (ctx, _poem, next) => {
      poem = _poem;
      next();
    })

    .define('Has $NUM verses', (ctx, verses, next) => {
      assert(poem.split(/\n\n/).length === 2);
      next();
    });

  return library;
})();
