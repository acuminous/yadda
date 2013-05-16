require('../../src/js/yadda-0.2.2');
require('../../src/js/yadda-0.2.2-localisation');

var assert = require("assert")
var library = require('./bottles-library').create();
var yadda = new Yadda.yadda(library, assert);

describe('Bottles', function() {
    
    it('should fall from the wall', function(done) {
        yadda.yadda([
            "Given 100 green bottles are standing on the wall",
            "when 1 green bottle accidentally falls",
            "then there are 99 green bottles standing on the wall",
        ]);
        done();
    });

    it('should bounce back onto wall', function(done) {
        yadda.yadda([
            "When another green bottle accidentally falls",
            "with a loud bang",
            "but bounces back",
            "then there are still 99 green bottles standing on the wall"
        ]);
        done();
    });
})
