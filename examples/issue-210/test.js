var Promise = require("bluebird");
var pgPromise = require("pg-promise");

var Yadda = require('yadda');
Yadda.plugins.mocha.StepLevelPlugin.init();

var pgp = null;
var db = null;

// Establish before hook - this will run before any feature file is executed
before(initDb);

// Establish after hook - this will run after all feature files have been executed
after(releaseDb);

new Yadda.FeatureFileSearch('./features').each(function(file) {

    featureFile(file, function(feature) {

        var library = require('./bottles-library')
        var yadda = Yadda.createInstance(library);

        scenarios(feature.scenarios, function(scenario) {

            // Truncate tables before every scenario
            before(truncateTables);

            var ctx = {};
            steps(scenario.steps, function(step, done) {
                yadda.run(step, { ctx: ctx }, done);
            });
        });
    });
});


function initDb(done) {
    var pgpOptions = {
        promiseLib: Promise
    };

    var dbConfig = {
        host: 'localhost',
        port: 5432,
        database: 'test',
        user: 'postgres',
        password: 'secret'
    };

    // Initialize pg-promise & db
    pgp = pgPromise(pgpOptions);
    db = pgp(dbConfig);
    done();
}

function releaseDb(done) {
    pgp.end();
    done();
}

function truncateTables(done) {
    return db.result('truncate table test1, test2 cascade')
        .then(function() {
            done();
        });
}