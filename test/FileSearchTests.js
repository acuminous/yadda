var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var path = require('path');
var assert = require('assert');
var FileSearch = require('../lib/FileSearch');

describe('FileSearch', () => {
  it('should return all files by default', () => {
    var files = new FileSearch('./test/filesearch').list().sort();
    assert.equal(files.length, 6);
    assert.equal(files[0], path.join('test', 'filesearch', 'exclude.js'));
    assert.equal(files[1], path.join('test', 'filesearch', 'include.feature'));
    assert.equal(files[2], path.join('test', 'filesearch', 'subdir1', 'exclude.js'));
    assert.equal(files[3], path.join('test', 'filesearch', 'subdir1', 'include.spec'));
    assert.equal(files[4], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'exclude.js'));
    assert.equal(files[5], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.specification'));
  });

  it('should return the matching files when a regex is specified', () => {
    var files = new FileSearch('./test/filesearch', /.*\.feature$/).list();
    assert.equal(files.length, 1);
    assert.equal(files[0], path.join('test', 'filesearch', 'include.feature'));
  });

  it('should ignore missing search paths', () => {
    var files = new FileSearch(['./test/foo', './test/filesearch'], /.*\.feature$/).list();
    assert.equal(files.length, 1);
  });
});
