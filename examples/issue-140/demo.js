/* jslint node: true */
"use strict";

var Yadda = require('yadda');
var English = Yadda.localisation.English;
var library = English.library();

var steps = []

for (var i = 0; i < 2000; i++) {
    steps.push('Given some steps ' + i)
    library.given('some steps ' + i, function(next) {
        console.log('Running step')
        setImmediate(function() {
            next()
        })
    })
}

new Yadda.createInstance(library).run(steps, function() {
    console.log('done')
});