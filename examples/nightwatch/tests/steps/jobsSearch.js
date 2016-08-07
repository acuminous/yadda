var Yadda = require('yadda')
var dictionary = require('./dictionary')
var R = require('ramda')
var dictionary = require('./dictionary')

module.exports = (function() {

    return Yadda.localisation.English.library(dictionary)
        .when('I view the jobs search page', function() {
            this.browser.page.jobsSearch().navigate()
        })
        .when('I filter by $filters', function(filters) {
            this.browser.page.jobsSearch().refine(filters)
        })
        .then('I should be shown the search results page', function() {
            this.browser.page.jobsSearch().assertSearchResults()
        })
        .define('containing a list of at least $count jobs', function(count) {
            this.browser.page.jobsSearch().assertVisibleJobsCount(count)
        })
        .then('be informed that there are no results', function() {
            this.browser.page.jobsSearch().assertNoResults()
        })
})()
