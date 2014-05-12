/* jslint node: true */
/* global describe, it, beforeEach */
"use strict";

var hospital = require('./lib/hospital');
var Yadda = require('../lib/index').Yadda;

describe('Hospital', function() {

    var yadda;

    beforeEach(function() {
        var library = require('./lib/hospital-steps').init();
        yadda = new Yadda(library);
    });

    it('should admit an on template patient', function() {
        yadda.yadda([
            'Given that Bob Holness is a male, cardiovascular patient at Heathroad hospital',
            'and that Holbrook ward is a cardiovascular ward in Heathroad hospital',
            'and that bed 209 is a male bed in Holbrook ward',
            'when Bob is admitted to bed 209',
            'then he is marked as on template'
        ]);
    });

    it('should admit an off template patient', function() {
        yadda.yadda([
            'Given that Bob Holness is a male, cardiovascular patient at Heathroad hospital',
            'and that Bucklesham ward is a respiratory ward in Heathroad hospital',
            'and that bed 209 is a male bed in Bucklesham ward',
            'when Bob is admitted to bed 209',
            'then he is marked as off template'
        ]);
    });

});
