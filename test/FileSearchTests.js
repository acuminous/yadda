const { describe, it } = require('node:test');
const path = require('node:path');
const { equal: eq } = require('node:assert');
const FileSearch = require('../lib/FileSearch');

describe('FileSearch', () => {
  it('should return all files by default', () => {
    const files = new FileSearch('./test/filesearch').list().sort();
    eq(files.length, 6);
    eq(files[0], path.join('test', 'filesearch', 'exclude.js'));
    eq(files[1], path.join('test', 'filesearch', 'include.feature'));
    eq(files[2], path.join('test', 'filesearch', 'subdir1', 'exclude.js'));
    eq(files[3], path.join('test', 'filesearch', 'subdir1', 'include.spec'));
    eq(files[4], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'exclude.js'));
    eq(files[5], path.join('test', 'filesearch', 'subdir2', 'subdir3', 'include.specification'));
  });

  it('should return the matching files when a regex is specified', () => {
    const files = new FileSearch('./test/filesearch', /.*\.feature$/).list();
    eq(files.length, 1);
    eq(files[0], path.join('test', 'filesearch', 'include.feature'));
  });

  it('should ignore missing search paths', () => {
    const files = new FileSearch(['./test/foo', './test/filesearch'], /.*\.feature$/).list();
    eq(files.length, 1);
  });
});
