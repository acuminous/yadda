var Library = require('../../lib/localisation/English');
var Dictionary = require('../../lib/Dictionary');

module.exports.init = function() {

    var wall;

    var dictionary = new Dictionary()
        .define('NUM', /(\d+)/);
        
    var library = new Library(dictionary)

    .given("$NUM green bottles are standing on the wall", function(number_of_bottles) {
    	wall = new Wall(number_of_bottles);
        this.done();
    })

    .when("$NUM green bottle accidentally falls", function(number_of_falling_bottles) {	
        wall.fall(number_of_falling_bottles);
        this.done();        
    })

    .then("there (?:are|are still) $NUM green bottles standing on the wall", function(number_of_bottles) {
        this.assert.equal(number_of_bottles, wall.bottles);
        this.done();        
    })

    var Wall = function(bottles) {
        this.bottles = bottles;
        this.fall = function(n) {
            this.bottles -= n;
        }
        this.returned = function() {
            this.bottles++;
        }
    }

    return library;
};
