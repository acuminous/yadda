var path = require('path');
var assert = require('assert');
var FileSearch = require('../lib/utils/FileSearch');
var $ = require('../lib/Array');

describe('FileSearch', function() {

    it('should return the correct set of files', function() {
        var files = new FileSearch(relate('filesearch'), /.*\.txt$/).search();
        assert.equal(files.length, 3);
        assert.equal(files[0], path.join('test', 'filesearch', 'include.txt'));
        assert.equal(files[1], path.join('test', 'filesearch', 'subdir1', 'include.txt'));
        assert.equal(files[2], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.txt'));
    });


    it('should ignore missing search paths', function() {
        var files = new FileSearch(relate(['foo', 'filesearch']), /.*\.txt$/).search();
        assert.equal(files.length, 3);
    });

    function relate(files) {
        return $(files).collect(function(file) {
            return path.join(__dirname, file);
        }).naked();
    }

});