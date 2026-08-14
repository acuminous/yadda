const { describe, it } = require('node:test');
const path = require('node:path');
const { equal: eq } = require('node:assert');
const FeatureFileSearch = require('../lib/FeatureFileSearch');

describe('FeatureFileSearch', () => {
  it('should return only feature files', () => {
    const files = new FeatureFileSearch('./test/filesearch').list();
    eq(files.length, 3);
    eq(files[0], path.join('test', 'filesearch', 'include.feature'));
    eq(files[1], path.join('test', 'filesearch', 'subdir1', 'include.spec'));
    eq(files[2], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.specification'));
  });
});
