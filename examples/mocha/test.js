require('../../src/js/yadda-0.2.1');
require('../../src/js/yadda-0.2.1-localisation');

var assert = require("assert")
var library = require('./bottles-library').create();
var yadda = new Yadda.yadda(library, assert);

describe('100 Green Bottles', function() {
    describe('A bottle falls from the wall', function() {
        it('Should leave 99 bottles on the wall', function() {
            yadda.yadda([
                "Given 100 green bottles are standing on the wall",
                "when 1 green bottle accidentally falls",
                "then there are 99 green bottles standing on the wall",
            ]);
        })
    })
    describe('A bottle bounces back after falling', function() {
        it('Should leave 100 bottles on the wall', function() {
            yadda.yadda([
                "When another green bottle accidentally falls",
                "with a loud bang",
                "but bounces back",
                "then there are still 99 green bottles standing on the wall"
            ])
        })
    })
})
