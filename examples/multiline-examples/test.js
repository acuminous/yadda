/* jslint node: true */
/* global featureFile, scenarios, steps */
"use strict";

var fs = require('fs');
var Yadda = require('../../lib/index');
var parser = new Yadda.parsers.FeatureParser();
var library = require('./transpile-library');
var yadda = new Yadda.createInstance(library);

new Yadda.FeatureFileSearch('features').each(function(file) {

    var text = fs.readFileSync(file, 'utf8');
    var feature = parser.parse(text);

    run_scenario(0);

    function run_scenario(idx){
        if (idx>=feature.scenarios.length)
        {
            console.log('Test success');
            return;
        }
        var scenario=feature.scenarios[idx];
        var context={};
        var next=run_scenario.bind(this, idx+1);
        yadda.run(scenario.steps, context, next);

    }

});
