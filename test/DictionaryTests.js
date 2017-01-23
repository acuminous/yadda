"use strict";

var assert = require('assert');
var Dictionary = require('../lib/index').Dictionary;
var pass_through_converter = require('../lib/converters/pass-through-converter');

describe('Dictionary', function() {

    it('should default to a wild card match', function() {
        assert_pattern(new Dictionary(), '$missing', '(.+)');
    });

    it('should expand simple terms', function() {
        var dictionary = new Dictionary()
            .define('gender', '(male|female)')
            .define('speciality', /(cardiovascular|elderly care)/);

        assert_pattern(dictionary, '$gender', '(male|female)');
        assert_pattern(dictionary, '$speciality', '(cardiovascular|elderly care)');
        assert_pattern(dictionary,
            'Given a $gender, $speciality patient called $name',
            'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
        );
    });

    it('should expand complex terms', function() {
        var dictionary = new Dictionary()
            .define('address_line_1', '$number $street')
            .define('number', /(\d+)/)
            .define('street', /(\w+)/);

        assert_pattern(dictionary, '$address_line_1', '(\\d+) (\\w+)');
    });

    it('should report duplicate terms', function() {
        var dictionary = new Dictionary()
            .define('gender', '(male|female)');

        assert.throws(function() {
            dictionary.define('gender', 'anything');
        }, /Duplicate term: \[gender\]/);
    });

    it('should report cyclic definitions', function() {
        var dictionary = new Dictionary()
            .define('direct', '$direct')
            .define('indirect', '$intermediary')
            .define('intermediary', '$indirect');

        assert.throws(function() {
            dictionary.expand('$direct');
        }, /Circular Definition: \[direct\]/);

        assert.throws(function() {
            dictionary.expand('$indirect');
        }, /Circular Definition: \[indirect, intermediary\]/);
    });

    it('should merge with another dictionary', function() {
        var dictionary1 = new Dictionary().define('gender', /(male|female)/);
        var dictionary2 = new Dictionary().define('speciality', /(cardiovascular|elderly care)/);
        var dictionary3 = dictionary1.merge(dictionary2);

        assert_pattern(dictionary3, '$gender', '(male|female)');
        assert_pattern(dictionary3, '$speciality', '(cardiovascular|elderly care)');
    });

    it('should maintain prefix when merging dictionaries', function() {
        var dictionary1 = new Dictionary(':').define('gender', /(male|female)/);
        var dictionary2 = new Dictionary(':').merge(dictionary1);
        assert_pattern(dictionary2, ':gender', '(male|female)');
    });

    it('should not merge dictionaries with different prefixes', function() {
        var dictionary1 = new Dictionary('$');
        var dictionary2 = new Dictionary(':');

        assert.throws(function() {
            dictionary1.merge(dictionary2);
        }, /Cannot merge dictionaries with different prefixes/);
    });

    it('should report duplicate terms in merged dictionaries', function() {
        var dictionary1 = new Dictionary().define('gender', /(male|female)/);
        var dictionary2 = new Dictionary().define('gender', /(male|female)/);

        assert.throws(function() {
            dictionary1.merge(dictionary2);
        }, /Duplicate term: \[gender\]/);
    });

    it('should return a pass through converter each matching group', function() {
        var dictionary = new Dictionary();
        assert_converters(dictionary, /(1) (2) (3)/, [ pass_through_converter, pass_through_converter, pass_through_converter ]);
    });

    it('should return a pass through converter each undefined term', function() {
        var dictionary = new Dictionary();
        assert_converters(dictionary, '$foo $bar', [ pass_through_converter, pass_through_converter ]);
    });

    it('should default to the pass through converter for each matching group in a defined pattern', function() {
        var dictionary = new Dictionary()
            .define('foo', /(1)/)
            .define('bar', /(2) (3)/);
        assert_converters(dictionary, '$foo $bar', [ pass_through_converter, pass_through_converter, pass_through_converter ]);
    });

    it('should use the specified converters when specified', function() {
        var converter1 = function a(value, cb) {};
        var converter2 = function b(value, cb) {};
        var dictionary = new Dictionary()
            .define('foo', /(1)/, converter1)
            .define('bar', /(2) (3)/, [converter1, converter2] );
        assert_converters(dictionary, '$foo $bar', [ converter1, converter1, converter2 ]);
    });

    it('should allow patterns and terms to be mixed in the same signature', function() {
        var converter1 = function a(value, cb) {};
        var converter2 = function b(value, cb) {};
        var dictionary = new Dictionary()
            .define('foo', /(1)/, converter1)
            .define('bar', /(2) (3)/, [converter1, converter2] );
        assert_converters(dictionary, '(1) $foo (2) (3) $bar (4) $baz', [
            pass_through_converter,
            converter1,
            pass_through_converter,
            pass_through_converter,
            converter1,
            converter2,
            pass_through_converter,
            pass_through_converter
        ]);
    });

    it('should report expandable terms with converters', function() {
        assert.throws(function() {
            new Dictionary().define('address_line_1', '$number $street', pass_through_converter);
        }, /Expandable terms cannot use converters: \[address_line_1\]/);
    });

    it('should report terms with wrong number of converters for matching groups', function() {
        assert.throws(function() {
            new Dictionary().define('foo', '(1)', [pass_through_converter, pass_through_converter]);
        }, /Wrong number of converters for: \[foo\]/);
    });

    it('should support multi-arg converters', function() {
        var two_arg_converter = function(a, b, cb) {};

        var dictionary = new Dictionary()
            .define('foo', '(1) (2)', [two_arg_converter]);
        assert_converters(dictionary, '$foo', [ two_arg_converter ]);
    });

    it('should report multi-arg converters with the wrong number of matching groups', function() {
        var two_arg_converter = function(a, b, cb) {};

        assert.throws(function() {
            new Dictionary().define('foo', '(1)', [two_arg_converter]);
        }, /Wrong number of converters for: \[foo\]/);
    });

    function assert_pattern(dictionary, pattern, expected) {
        assert.equal(dictionary.expand(pattern).pattern, expected);
    }

    function assert_converters(dictionary, pattern, expected) {
        var converters = dictionary.expand(pattern).converters;
        assert.equal(converters.length, expected.length);
        for (var i = 0; i < expected.length; i++) {
            assert.equal(converters[i].toString(), expected[i].toString());
        }
    }
});
