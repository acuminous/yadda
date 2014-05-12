/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Library = require('../lib/index').Library;
var English = require('../lib/index').localisation.English;
var Dictionary = require('../lib/Dictionary');

describe('Library', function() {

    it('should hold String mapped macros', function() {
        var library = new Library()
            .define('foo');

        assert.ok(library.get_macro('foo'), 'Macro should have been defined');
        assert.ok(library.get_macro(/foo/), 'Macro should have been defined');
    });

    it('should hold RegExp mapped macros', function() {
        var library = new Library()
            .define(/bar/);

        assert.ok(library.get_macro(/bar/), 'Macro should have been defined');
        assert.ok(library.get_macro('bar'), 'Macro should have been defined');
    });

    it('should support aliased macros', function() {
        var library = new Library()
            .define([/bar/, /foo/]);

        assert.ok(library.get_macro(/bar/), 'Macro should have been defined');
        assert.ok(library.get_macro(/foo/), 'Macro should have been defined');
    });

    it('should expand macro signature using specified dictionary', function() {

        var dictionary = new Dictionary()
            .define('gender', '(male|female)')
            .define('speciality', '(cardiovascular|elderly care)');

        var library = new Library(dictionary)
            .define('Given a $gender, $speciality patient called $name');

        var macro = library.get_macro('Given a $gender, $speciality patient called $name');
        assert.ok(macro.can_interpret('Given a male, cardiovascular patient called Bob'));
        assert.ok(macro.can_interpret('Given a female, elderly care patient called Carol'));
        assert.ok(!macro.can_interpret('Given a ugly, angry patient called Max'));
    });

    it('should report duplicate macros', function() {

        var library = English.library()
            .define(/bar/);

        assert.throws(function() {
            library.define(/bar/);
        }, /Duplicate macro: \[\/bar\/\]/);
    });

    it('should find all compatible macros', function() {

        var library = new Library()
            .define(/^food$/)
            .define(/^foo.*$/)
            .define(/^f.*$/);

        assert.equal(library.find_compatible_macros('fort').length, 1);
        assert.equal(library.find_compatible_macros('foodie').length, 2);
        assert.equal(library.find_compatible_macros('food').length, 3);
    });

    it('should be localised', function() {

        var library = English.library()
            .given(/^a wall with (\d+) bottles/)
            .when(/^(\d+) bottle(?:s)? accidentally falls/)
            .then(/^there are (\d+) bottles left/);

        var givens = [
            'Given a wall with 100 bottles',
            'given a wall with 100 bottles',
            'And a wall with 100 bottles',
            'and a wall with 100 bottles',
            'with   a wall with 100 bottles'
        ];

        var whens = [
            'When 1 bottle accidentally falls',
            'when 1 bottle accidentally falls',
            'and 1 bottle accidentally falls',
            'And 1 bottle accidentally falls',
            'but  1 bottle accidentally falls'
        ];

        var thens = [
            'Then there are 99 bottles left',
            'then there are 99 bottles left',
            'And there are 99 bottles left',
            'and there are 99 bottles left',
            'Expect there are 99 bottles left',
            'expect there are 99 bottles left',
            'but  there are 99 bottles left'
        ];

        assert_localisation(library, givens, '/(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)\\s+a wall with (\\d+) bottles/');
        assert_localisation(library, whens, '/(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)\\s+(\\d+) bottle(?:s)? accidentally falls/');
        assert_localisation(library, thens, '/(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)\\s+there are (\\d+) bottles left/');
    });

    it('should supports localised aliased macros', function() {

        var library = English.library()
            .given([/^a wall with (\d+) bottles/, /^a wall with (\d+) green bottles/])
            .when([/^(\d+) bottle(?:s)? accidentally falls/, /^(\d+) green bottle(?:s)? accidentally falls/])
            .then([/^there are (\d+) bottles left/, /^there are (\d+) green bottles left/]);

        assert.equal(library.find_compatible_macros('Given a wall with 100 bottles').length, 1);
        assert.equal(library.find_compatible_macros('Given a wall with 100 green bottles').length, 1);
        assert.equal(library.find_compatible_macros('When 1 bottle accidentally falls').length, 1);
        assert.equal(library.find_compatible_macros('When 1 green bottle accidentally falls').length, 1);
        assert.equal(library.find_compatible_macros('Then there are 99 bottles left').length, 1);
        assert.equal(library.find_compatible_macros('Then there are 99 green bottles left').length, 1);
    });

    function assert_localisation(library, statements, signature) {
        for (var i = 0; i < statements.length; i++) {
            assert.equal(library.find_compatible_macros(statements[i]).length, 1, statements[i]);
            assert.equal(library.find_compatible_macros(statements[i])[0].signature, signature, statements[i]);
        }
    }

});
