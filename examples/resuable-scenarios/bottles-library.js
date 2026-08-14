const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const assert = require('assert');
const format = require('util').format;

module.exports = (function () {
  let wall;
  const dictionary = new Dictionary().define('NUM', /(\d+)/);
  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .define('Sing $NUM $COLOUR bottles', function (number_of_bottles, colour, next) {
      this.yadda.run([format('Given %d %s bottles are standing on the wall', number_of_bottles, colour), format('When 1 %s bottle accidentally falls', colour), format('Then there are %d %s bottles standing on the wall', number_of_bottles - 1, colour)], next);
    })

    .given('$NUM $COLOUR bottles are standing on the wall', function (number_of_bottles, colour, next) {
      wall = wall || new Wall();
      wall.bottles = number_of_bottles;
      wall.bottleColour = colour;
      next();
    })

    .when('$NUM $COLOUR bottle accidentally falls', function (number_of_falling_bottles, colour, next) {
      wall.fall(number_of_falling_bottles);
      next();
    })

    .then('there (?:are|are still) $NUM $COLOUR bottles standing on the wall', function (number_of_bottles, colour, next) {
      assert.equal(number_of_bottles, wall.bottles);
      next();
    });

  const Wall = function (bottles) {
    this.bottles = bottles;
    this.fall = function (n) {
      this.bottles -= n;
    };
    this.returned = function () {
      this.bottles++;
    };
  };

  return library;
})();
