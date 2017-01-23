"use strict";

var assert = require('assert');
var StringUtils = require('../lib/StringUtils');

describe('StringUtils', function() {

    it('should detect blank strings', function() {
        assert.ok(StringUtils.isBlank(''));
        assert.ok(StringUtils.isBlank(' '));
        assert.ok(StringUtils.isNotBlank('x'));
        assert.ok(StringUtils.isNotBlank(' x '));
    });

    it('should return the indentation size', function() {
        assert.equal(StringUtils.indentation(''), 0);
        assert.equal(StringUtils.indentation(' '), 1);
    });
});
