test('Dictionary expands terms', function() {

    var dictionary = new Yadda.Dictionary()
        .define('gender', '(male|female)')
        .define('speciality', /(cardiovascular|elderly care)/)
        .define('address_line_1', '$number $street')
        .define('number', /(\d+)/)
        .define('street', /(\w+)/);

    equal(dictionary.expand('$gender'), '(male|female)');
    equal(dictionary.expand('$speciality'), '(cardiovascular|elderly care)');
    equal(dictionary.expand('$address_line_1'), '(\\d+) (\\w+)');
    equal(
        dictionary.expand('Given a $gender, $speciality patient called $name'), 
        'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
    );
});

test('Dictionary reports duplicate definitions', function() {

    var dictionary = new Yadda.Dictionary()
        .define('gender', '(male|female)');

    raises(function() {
        dictionary.define('gender', 'anything');
    }, /Duplicate definition: \[gender\]/);

});

test('Dictinoary reports cyclic definitions', function() {

    var dictionary = new Yadda.Dictionary()
        .define('direct', '$direct')
        .define('indirect', '$intermediary')
        .define('intermediary', '$indirect');

    raises(function() {
        dictionary.expand('$direct');
    }, /Circular Definition: \[direct\]/);

    raises(function() {
        dictionary.expand('$indirect');
    }, /Circular Definition: \[indirect, intermediary\]/);
});