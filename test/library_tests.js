var NO_OP = function() {};

test('Library can hold String mapped macros', function() {
    var library = new Yadda.Library();
    
    library.define('foo', NO_OP);

    ok(library.get_macro('foo'), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
});

test('Library can hold RegExp mapped macros', function() {
    var library = new Yadda.Library()
        .define(/bar/, NO_OP);

    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro('bar'), 'Macro should have been defined');
});

test('Library supports aliased macros', function() {
    var library = new Yadda.Library()
        .define([/bar/, /foo/], NO_OP)

    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
})

test('Library expands macro signature using specified dictionary', function() {

    var dictionary = new Yadda.Dictionary()
        .define('gender', '(male|female)')
        .define('speciality', '(cardiovascular|elderly care)');

    var library = new Yadda.Library(dictionary)
        .define('Given a $gender, $speciality patient called $name', NO_OP);

    equal(
        library.get_macro('Given a $gender, $speciality patient called $name').signature_pattern.source,
        'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
    );
})

test('Library reports duplicate macros', function() {

    var library = new Yadda.Library()
        .define(/bar/, NO_OP);    

    raises(function() {
        library.define(/bar/, NO_OP);
    }, 'Duplicate macro: [/blah/]')
});

test('Library finds all compatible macros', function() {

    var library = new Yadda.Library()   
        .define(/^food$/, NO_OP)
        .define(/^foo.*$/, NO_OP)
        .define(/^f.*$/, NO_OP);

    equal(library.find_compatible_macros('fort').length, 1);
    equal(library.find_compatible_macros('foodie').length, 2);
    equal(library.find_compatible_macros('food').length, 3);
});

test('Library can be localised', function() {

    var library = Yadda.Library.English()
        .given(/^a wall with (\d+) bottles/, NO_OP)
        .when(/^(\d+) bottle(?:s)? accidentally falls/, NO_OP)
        .then(/^there are (\d+) bottles left/, NO_OP);

    var givens = [
        'Given a wall with 100 bottles',
        'Given a wall with 100 bottles',
        'And a wall with 100 bottles',
        'and a wall with 100 bottles'
    ];

    var whens = [
        'When 1 bottle accidentally falls',
        'when 1 bottle accidentally falls',
        'and 1 bottle accidentally falls',
        'And 1 bottle accidentally falls'
    ];

    var thens = [
        'Then there are 99 bottles left',
        'then there are 99 bottles left',
        'And there are 99 bottles left',
        'and there are 99 bottles left',
        'Expect there are 99 bottles left',
        'expect there are 99 bottles left'
    ];

    var assert_localisation = function(statements, signature) {
        for (var i = 0; i < statements.length; i++) {   
            equal(library.find_compatible_macros(statements[i]).length, 1, statements[i]);
            equal(library.find_compatible_macros(statements[i])[0].signature, signature, statements[i]);
        }        
    }
    
    assert_localisation(givens, '/(?:[Gg]iven|[Ww]ith|[Aa]nd) a wall with (\\d+) bottles/');
    assert_localisation(whens, '/(?:[Ww]hen|[Aa]nd) (\\d+) bottle(?:s)? accidentally falls/');
    assert_localisation(thens, '/(?:[Tt]hen|[Ee]xpect|[Aa]nd) there are (\\d+) bottles left/');
});

test('Library localision supports aliased macros', function() {

    var library = Yadda.Library.English()
        .given([/^a wall with (\d+) bottles/, /^a wall with (\d+) green bottles/], NO_OP)
        .when([/^(\d+) bottle(?:s)? accidentally falls/, /^(\d+) green bottle(?:s)? accidentally falls/], NO_OP)
        .then([/^there are (\d+) bottles left/, /^there are (\d+) green bottles left/], NO_OP);
    
    equal(library.find_compatible_macros('Given a wall with 100 bottles').length, 1);
    equal(library.find_compatible_macros('Given a wall with 100 green bottles').length, 1);
    equal(library.find_compatible_macros('When 1 bottle accidentally falls').length, 1);
    equal(library.find_compatible_macros('When 1 green bottle accidentally falls').length, 1);
    equal(library.find_compatible_macros('Then there are 99 bottles left').length, 1);
    equal(library.find_compatible_macros('Then there are 99 green bottles left').length, 1);
});

