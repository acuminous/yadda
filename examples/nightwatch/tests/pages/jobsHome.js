var debug = require('debug')('testsuite:jobsHome');
var R = require('ramda');

module.exports = {
  url: function () {
    return this.api.launchUrl + '/jobs';
  },
  elements: {
    main: {
      selector: 'main[data-type="jobs-home-live"]',
    },
    keywordsInput: {
      selector: '#job-hubs-search__keywords',
    },
    searchButton: {
      selector: '.job-hubs-search button',
    },
    searchCount: {
      selector: '.seo-number-of-jobs',
    },
  },
  commands: [
    {
      browse: function (facetName) {
        debug('Browsing %s', facetName);
        var selector = '.facet-items__item[data-id="' + facetName + '"]';
        return this.waitForElementVisible(selector).click(selector);
      },
      search: function (keywords) {
        debug('Search for %s', keywords);
        this.setValue('@keywordsInput', keywords);
        this.click('@searchButton');
      },
    },
  ],
};
