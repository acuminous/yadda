const Yadda = require('yadda');
const English = Yadda.localisation.English;
const Dictionary = Yadda.Dictionary;
const assert = require('assert');

module.exports = (function () {
  let wall;
  const dictionary = new Dictionary().define('NUM', /(\d+)/);
  const library = English.localise(new Yadda.ContextParamLibrary(dictionary))

    .given('a $NUM foot wall', (ctx, height) => {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          wall = new Wall();
          resolve(true);
        }, 100);
      });
    })

    .given('$NUM green $ITEMS are standing on the wall', (ctx, number_of_items, item_type) => {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          wall.items = number_of_items;
          resolve(true);
        }, 100);
      });
    })

    .when('$NUM green $ITEM accidentally falls', (ctx, number_of_falling_items, item_type) => {
      return new Promise(function (resolve, reject) {
        setTimeout(function () {
          wall.fall(number_of_falling_items);
          resolve(true);
        }, 100);
      });
    })

    .then('there (?:are|are still) $NUM green $ITEMS standing on the wall', (ctx, number_of_items, item_type) => {
      return new Promise(function (resolve, reject) {
        assert.equal(number_of_items, wall.items);
        resolve(true);
      });
    });

  const Wall = function (items) {
    this.items = items;
    this.fall = function (n) {
      this.items -= n;
    };
    this.returned = function () {
      this.items++;
    };
  };

  return library;
})();
