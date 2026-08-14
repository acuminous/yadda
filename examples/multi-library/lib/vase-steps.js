const Yadda = require('yadda');
const English = Yadda.localisation.English;
const assert = require('assert');
const dictionary = require('./dictionary');
const Wall = require('./Wall');

module.exports = (function () {
  let wall;
  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .given('$NUM green vases are standing on the wall', function (number_of_vases, next) {
      wall = new Wall(number_of_vases);
      next();
    })

    .when('$NUM green vase accidentally falls', function (number_of_falling_vases, next) {
      wall.fall(number_of_falling_vases);
      next();
    })

    .then('there (?:are|are still) $NUM green vases standing on the wall', function (number_of_vases, next) {
      assert.equal(number_of_vases, wall.items);
      next();
    });

  return library;
})();
