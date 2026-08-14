const FileSearch = require('./FileSearch');

const FeatureFileSearch = function (directories) {
  this.constructor(directories, /.*\.(?:feature|spec|specification)$/);
};
FeatureFileSearch.prototype = new FileSearch();

module.exports = FeatureFileSearch;
