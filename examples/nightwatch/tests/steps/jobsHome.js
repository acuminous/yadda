var Yadda = require('yadda')
var dictionary = require('./dictionary')
var R = require('ramda')

module.exports = (function() {

    return Yadda.localisation.English.library(dictionary)
        .when('I view the jobs home page', function() {
            this.browser.page.jobsHome().navigate()
        })
        .when('search for $keywords', function(keywords) {
            this.browser.page.jobsHome().search(keywords)
        })
})()