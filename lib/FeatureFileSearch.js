"use strict";

var FileSearch = require('./FileSearch');

var FeatureFileSearch = function(directories) {
    this.constructor(directories, /.*\.(?:feature|spec|specification)$/);
};
FeatureFileSearch.prototype = new FileSearch();

module.exports = FeatureFileSearch;
