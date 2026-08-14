const path = require('node:path');
const fs = require('node:fs');
const $ = require('./Array');

// Searches for files in the given directories and their sub-directories, matching at least one of the given patterns
const FileSearch = function (directories, patterns = /.*/) {
  this.each = function (fn) {
    this.list().forEach(fn);
  };

  this.list = () => $(directories).inject($(), (files, directory) => files.concat(list_files(directory).find_all(by_pattern)));

  const list_files = (directory) => $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));

  const list_immediate_files = (directory) => ls(directory).find_all(by_file);

  const list_sub_directory_files = (directory) =>
    ls(directory)
      .find_all(by_directory)
      .inject($(), (files, directory) => files.concat(list_files(directory)));

  const ls = (directory) => {
    if (!fs.existsSync(directory)) return $();
    return $(fs.readdirSync(directory)).collect((file) => path.join(directory, file));
  };

  const by_file = (file) => !by_directory(file);

  const by_directory = (file) => fs.statSync(file).isDirectory();

  const by_pattern = (filename) => $(patterns).find((pattern) => new RegExp(pattern).test(filename));
};

module.exports = FileSearch;
