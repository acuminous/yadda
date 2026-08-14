var nodeTest = require('node:test');
var describe = nodeTest.describe;
var it = nodeTest.it;
var path = require('node:path');
var assert = require('node:assert');
var FeatureFileSearch = require('../lib/FeatureFileSearch');

describe('FeatureFileSearch', () => {
  it('should return only feature files', () => {
    var files = new FeatureFileSearch('./test/filesearch').list();
    assert.equal(files.length, 3);
    assert.equal(files[0], path.join('test', 'filesearch', 'include.feature'));
    assert.equal(files[1], path.join('test', 'filesearch', 'subdir1', 'include.spec'));
    assert.equal(files[2], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.specification'));
  });
});
