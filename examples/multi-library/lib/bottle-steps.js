const Yadda = require('yadda');
const English = Yadda.localisation.English;
const assert = require('assert');
const dictionary = require('./dictionary');
const Wall = require('./Wall');

module.exports = (function () {
  let wall;

  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .given('$NUM green bottles are standing on the wall', function (number_of_bottles, next) {
      wall = new Wall(number_of_bottles);
      next();
    })

    .when('$NUM green bottle accidentally falls', function (number_of_falling_bottles, next) {
      wall.fall(number_of_falling_bottles);
      next();
    })

    .then('there (?:are|are still) $NUM green bottles standing on the wall', function (number_of_bottles, next) {
      assert.equal(number_of_bottles, wall.items);
      next();
    });

  return library;
})();
