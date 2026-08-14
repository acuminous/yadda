var path = require('path');
var fs = require('fs');
var $ = require('./Array');

// Searches for files in the given directories and their sub-directories, matching at least one of the given patterns
var FileSearch = function (directories, patterns) {
  var patterns = patterns || /.*/;

  this.each = function (fn) {
    this.list().forEach(fn);
  };

  this.list = () => $(directories).inject($(), (files, directory) => files.concat(list_files(directory).find_all(by_pattern)));

  var list_files = (directory) => $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));

  var list_immediate_files = (directory) => ls(directory).find_all(by_file);

  var list_sub_directory_files = (directory) =>
    ls(directory)
      .find_all(by_directory)
      .inject($(), (files, directory) => files.concat(list_files(directory)));

  var ls = (directory) => {
    if (!fs.existsSync(directory)) return $();
    return $(fs.readdirSync(directory)).collect((file) => path.join(directory, file));
  };

  var by_file = (file) => !by_directory(file);

  var by_directory = (file) => fs.statSync(file).isDirectory();

  var by_pattern = (filename) => $(patterns).find((pattern) => new RegExp(pattern).test(filename));
};

module.exports = FileSearch;
