const Pirate = require('../../lib/localisation/Pirate');
const ContextParamLibrary = require('../../lib/ContextParamLibrary');
const Dictionary = require('../../lib/Dictionary');
const assert = require('assert');

module.exports = (function () {
  let wall;

  const dictionary = new Dictionary().define('NUM', /(\d+)/);

  const library = Pirate.localise(new ContextParamLibrary(dictionary))

    .given('$NUM green bottles are standing on the wall', (ctx, number_of_bottles, next) => {
      wall = new Wall(number_of_bottles);
      next();
    })

    .when('$NUM green bottle accidentally falls', (ctx, number_of_falling_bottles, next) => {
      wall.fall(number_of_falling_bottles);
      next();
    })

    .then('there (?:are|are still) $NUM green bottles standing on the wall', (ctx, number_of_bottles, next) => {
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
