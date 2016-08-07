var debug = require('debug')('testsuite:jobsSearch')
var R = require('ramda')
var Url = require('url')

module.exports = {
    url: function() {
        return this.api.launchUrl + '/jobs/search';
    },
    elements: {
        jobListing: {
            selector: '.t-jobs-listing'
        },
        searchButton: {
            selector: '.t-keyword-search-button'
        },
        jobs: {
            selector: '.t-job'
        },
        noResults: {
            selector: '.t-no-results'
        }
    },
    commands: [
        {
            assertSearchResults: function() {
                return this.waitForElementVisible('@jobListing')
            }
        },
        {
            assertVisibleJobsCount: function(count) {
                var self = this
                self.waitForElementVisible('@jobListing')
                return self.api.elements('css selector', '.t-job', function(result) {
                    self.assert.ok(result.value.length >= count)
                })
            }
        },
        {
            assertNoResults: function() {
                return this.waitForElementVisible('@noResults')
            }
        },
        {
            search: function(keywords) {
                debug('Search for %s', keywords)
                this.setValue('@keywordsInput', keywords);
                this.click('@searchButton')
            }
        },
        {
            refine: function(filters) {
                debug('refine')
                var searchUrl = Url.parse(this.api.launchUrl + '/jobs/search')
                var refinedSearchUrl = Url.format(R.mergeAll([searchUrl, { query: filters }]), true)
                return this.api.url(refinedSearchUrl)
            }
        }
    ]
}
