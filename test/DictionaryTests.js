var assert = require('./lib/assert');
var Dictionary = require('../lib/index').Dictionary;

describe('Dictionary', function() {

    var dictionary;

    beforeEach(function() {
        dictionary = new Dictionary();        
    })

    it('should default to a wild card match', function() {
        assert_definition('$missing', '(.+)');
    });

    it('should expand simple terms', function() {

        define('gender', '(male|female)');
        define('speciality', /(cardiovascular|elderly care)/);

        assert_definition('$gender', '(male|female)');
        assert_definition('$speciality', '(cardiovascular|elderly care)');
        assert_definition(
            'Given a $gender, $speciality patient called $name', 
            'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
        );
    });

    it('should expand complex terms', function() {

        define('address_line_1', '$number $street');
        define('number', /(\d+)/);
        define('street', /(\w+)/);

        assert_definition('$address_line_1', '(\\d+) (\\w+)');
    });

    it('should report duplicate definitions', function() {

        define('gender', '(male|female)');

        assert.raises(function() {
            dictionary.define('gender', 'anything');
        }, /Duplicate definition: \[gender\]/);
    });

    it('should report cyclic definitions', function() {

        define('direct', '$direct');
        define('indirect', '$intermediary');
        define('intermediary', '$indirect');

        assert.raises(function() {
            dictionary.expand('$direct');
        }, /Circular Definition: \[direct\]/);

        assert.raises(function() {
            dictionary.expand('$indirect');
        }, /Circular Definition: \[indirect, intermediary\]/);
    });

    function assert_definition(term, expected) {
        assert.equal(dictionary.expand(term), expected);
    }

    function define(term, definition) {
        dictionary.define(term, definition);    
    }
});