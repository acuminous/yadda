const Yadda = require('yadda');
const English = Yadda.localisation.English;
const assert = require('assert');
const format = require('util').format;

module.exports = (function () {
  let wall;

  const library = English.localise(new Yadda.ContextBoundLibrary())
    .given('$NUM green bottles are standing on the wall', function (number_of_bottles, next) {
      wall = new Wall(number_of_bottles);
      wall.printStatus();
      next();
    })
    .when('$NUM green bottle accidentally falls', function (number_of_falling_bottles, next) {
      wall.fall(number_of_falling_bottles);
      console.log('%s bottle falls', number_of_falling_bottles);
      next();
    })
    .then('there are $NUM green bottles standing on the wall', function (number_of_bottles, next) {
      if (number_of_bottles != wall.bottles) return next(new Error(format('Expected %d but got %d', number_of_bottles, wall.bottles)));
      wall.printStatus();
      next();
    });

  function Wall(bottles) {
    this.bottles = bottles;
    this.fall = function (n) {
      this.bottles -= n;
    };
    this.returned = function () {
      this.bottles++;
    };
    this.printStatus = function () {
      console.log('There are %s bottles on the wall', this.bottles);
    };
  }

  return library;
})();
