test('Library can hold String mapped macros', function() {
    var library = new Yadda.Library();
    
    library.define('foo', function() {});

    ok(library.get_macro('foo'), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
});

test('Library can hold RegExp mapped macros', function() {
    var library = new Yadda.Library();
    
    library.define(/bar/, function() {});

    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro('bar'), 'Macro should have been defined');
});

test('Library expands macro signature using specified dictionary', function() {

    // var dictionary = new Yadda.Dictionary()
    //     .define('gender', '(male|female)')
    //     .define('speciality', '(cardiovascular|elderly care)');

    // var library = new Yadda.Library(dictionary)
    //     .define('Given a $gender, $speciality patient called $name', function() {});

    // equal(library.get_macro('Given a $gender, $speciality patient called $name/, ))
})

test('Library reports duplicate macros', function() {

    var library = new Yadda.Library();

    library.define(/bar/, function() {});    

    raises(function() {
        library.define(/bar/, function() {});
    }, 'Duplicate macro: [/blah/]')
});

test('Library finds all compatible macros', function() {

    var library = new Yadda.Library();
    library.define(/^food$/, function() {});
    library.define(/^foo.*$/, function() {});
    library.define(/^f.*$/, function() {});

    equal(library.find_compatible_macros('fort').length, 1);
    equal(library.find_compatible_macros('foodie').length, 2);
    equal(library.find_compatible_macros('food').length, 3);
});

