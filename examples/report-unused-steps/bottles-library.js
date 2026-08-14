const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const assert = require('assert');

module.exports = (function () {
  let wall;
  const dictionary = new Dictionary().define('NUM', /(\d+)/);
  const library = English.localise(new Yadda.ContextBoundLibrary(dictionary))

    .given('An unused step')

    .given(['Another unused step', 'Yet $another unused step'])

    .given('a $NUM foot wall', function (height, next) {
      wall = new Wall();
      next();
    })

    .given('$NUM green bottles are standing on the wall', function (number_of_bottles, next) {
      wall.bottles = number_of_bottles;
      next();
    })

    .when('$NUM green bottle accidentally falls', function (number_of_falling_bottles, next) {
      wall.fall(number_of_falling_bottles);
      next();
    })

    .then('there (?:are|are still) $NUM green bottles standing on the wall', function (number_of_bottles, next) {
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
