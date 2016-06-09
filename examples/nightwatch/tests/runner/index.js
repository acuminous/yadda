var assert = require('assert')
var R = require('ramda')
var Yadda = require('yadda')
var fs = require('fs')
var glob = require('glob')
var chalk = require('chalk')
var stepDefinitions = [
    require('../steps/jobsHome'),
    require('../steps/jobsSearch')
]

var featureParser = new Yadda.parsers.FeatureParser()
var features = {}

before(function(client, done) {
    done()
})

after(function(client, done) {
    client.end(function() {
        done()
    })
});

glob.sync("tests/features/**/*.spec").forEach(function(file) {
    var text = fs.readFileSync(file, 'utf8')
    var feature = featureParser.parse(text)

    describe(feature, function() {
        feature.scenarios.forEach(function(scenario) {
            describe(scenario, function() {
                var yadda = Yadda.createInstance(stepDefinitions, { ctx: {} })
                scenario.steps.forEach(function(step) {
                    it(step, function(browser) {
                        browser.perform(function(client, done) {
                            yadda.run(step, { browser: browser }, function(err) {
                                browser.assert.ifError(err)
                                done()
                            })
                        })
                    })
                })
            })
        })
    })
})

function describe(subject, next) {
    if (subject.annotations && subject.annotations.pending) return global.describe.skip(subject.title, next)
    if (subject.annotations && subject.annotations.only) return global.describe.only(subject.title, next)
    global.describe(subject.title, next)
}

