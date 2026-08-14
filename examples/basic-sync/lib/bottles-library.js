const Yadda = require('yadda');
const English = Yadda.localisation.English;
const assert = require('assert');

module.exports = (function () {
  let wall;

  const library = English.localise(new Yadda.ContextParamLibrary())
    .given('$NUM green bottles are standing on the wall', (ctx, number_of_bottles) => {
      wall = new Wall(number_of_bottles);
      wall.printStatus();
    })
    .when('$NUM green bottle accidentally falls', (ctx, number_of_falling_bottles) => {
      wall.fall(number_of_falling_bottles);
      console.log('%s bottle falls', number_of_falling_bottles);
    })
    .then('there are $NUM green bottles standing on the wall', (ctx, number_of_bottles) => {
      assert.equal(number_of_bottles, wall.bottles);
      wall.printStatus();
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
