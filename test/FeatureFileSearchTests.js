"use strict";

var path = require('../lib/shims').path;
var assert = require('assert');
var FeatureFileSearch = require('../lib/FeatureFileSearch');

describe('FeatureFileSearch', function() {

    it('should return only feature files', function() {
        var files = new FeatureFileSearch('./test/filesearch').list();
        assert.equal(files.length, 3);
        assert.equal(files[0], path.join('test', 'filesearch', 'include.feature'));
        assert.equal(files[1], path.join('test', 'filesearch', 'subdir1', 'include.spec'));
        assert.equal(files[2], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.specification'));
    });
});
