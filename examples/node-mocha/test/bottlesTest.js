var Mocha = require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require("assert");
var _ = require("underscore");
var Test = require('mocha').Test;
var mocha = new Mocha;
var specifications = './test/spec';
var spec_extension = '_spec.js'
require('../../../src/js/yadda-0.2.2.js');
require('../../../src/js/yadda-0.2.2-localisation.js');
require('../../../src/js/yadda-0.2.2-text-parser.js');


function bySpecification(file) {
    return file.substr(-8) === spec_extension;
};

var importSpecifications = function(file) {
    var text = fs.readFileSync(path.join(specifications, file), 'utf8');
    var parser = new Yadda.Parsers.TextParser();    
    var scenarios = parser.parse(text);

    var library = require('./lib/bottles-library').create();
    var yadda = new Yadda.yadda(library, assert);

    _.each(scenarios, function(scenario) {
        mocha.suite.addTest(new Test(scenario.title, function() {
            yadda.yadda(scenario.steps);        
        }));
    });
};

fs.readdirSync(specifications).filter(bySpecification).forEach(importSpecifications);

mocha.run(function(failures){
  process.exit(failures);
}); 