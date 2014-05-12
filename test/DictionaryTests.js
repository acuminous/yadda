/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Dictionary = require('../lib/index').Dictionary;

describe('Dictionary', function() {

    it('should default to a wild card match', function() {
        assert_definition(new Dictionary(), '$missing', '(.+)');
    });

    it('should expand simple terms', function() {
        var dictionary = new Dictionary()
            .define('gender', '(male|female)')
            .define('speciality', /(cardiovascular|elderly care)/);

        assert_definition(dictionary, '$gender', '(male|female)');
        assert_definition(dictionary, '$speciality', '(cardiovascular|elderly care)');
        assert_definition(dictionary,
            'Given a $gender, $speciality patient called $name',
            'Given a (male|female), (cardiovascular|elderly care) patient called (.+)'
        );
    });

    it('should expand complex terms', function() {
        var dictionary = new Dictionary()
            .define('address_line_1', '$number $street')
            .define('number', /(\d+)/)
            .define('street', /(\w+)/);

        assert_definition(dictionary, '$address_line_1', '(\\d+) (\\w+)');
    });

    it('should report duplicate definitions', function() {
        var dictionary = new Dictionary()
            .define('gender', '(male|female)');

        assert.throws(function() {
            dictionary.define('gender', 'anything');
        }, /Duplicate definition: \[gender\]/);
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

        assert_definition(dictionary3, '$gender', '(male|female)');
        assert_definition(dictionary3, '$speciality', '(cardiovascular|elderly care)');
    });

    it('should maintain prefix when merging dictionaries', function() {
        var dictionary1 = new Dictionary(':').define('gender', /(male|female)/);
        var dictionary2 = new Dictionary(':').merge(dictionary1);
        assert_definition(dictionary2, ':gender', '(male|female)');
    });

    it('should not merge dictionaries with different prefixes', function() {
        var dictionary1 = new Dictionary('$');
        var dictionary2 = new Dictionary(':');

        assert.throws(function() {
            dictionary1.merge(dictionary2);
        }, /Cannot merge dictionaries with different prefixes/);
    });

    it('should report duplicate definitions in merged dictionaries', function() {
        var dictionary1 = new Dictionary().define('gender', /(male|female)/);
        var dictionary2 = new Dictionary().define('gender', /(male|female)/);

        assert.throws(function() {
            dictionary1.merge(dictionary2);
        }, /Duplicate definition: \[gender\]/);
    });

    function assert_definition(dictionary, term, expected) {
        assert.equal(dictionary.expand(term), expected);
    }
});
