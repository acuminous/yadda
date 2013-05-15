var dictionary;

var assert_definition = function(term, expected) {
    equal(dictionary.expand(term), expected);
}

var define = function(term, definition) {
    dictionary.define(term, definition);    
}

module('dictionary', {
    setup: function() {
        dictionary = new Yadda.Dictionary();
    }
});

test('Dictionary defaults to a wild card match', function() {
    assert_definition('$missing', '(.+)');
});

test('Dictionary expands simple terms', function() {

    define('gender', '(male|female)');
    define('speciality', /(cardiovascular|elderly care)/);

    assert_definition('$gender', '(male|female)');
    assert_definition('$speciality', '(cardiovascular|elderly care)');
    assert_definition(
        'Given a $gender, $speciality patient called $name', 
        'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
    );
});

test('Dictionary expands complex terms', function() {

    define('address_line_1', '$number $street');
    define('number', /(\d+)/);
    define('street', /(\w+)/);

    assert_definition('$address_line_1', '(\\d+) (\\w+)');
});

test('Dictionary reports duplicate definitions', function() {

    define('gender', '(male|female)');

    raises(function() {
        dictionary.define('gender', 'anything');
    }, /Duplicate definition: \[gender\]/);
});

test('Dictionary reports cyclic definitions', function() {

    define('direct', '$direct');
    define('indirect', '$intermediary');
    define('intermediary', '$indirect');

    raises(function() {
        dictionary.expand('$direct');
    }, /Circular Definition: \[direct\]/);

    raises(function() {
        dictionary.expand('$indirect');
    }, /Circular Definition: \[indirect, intermediary\]/);
});