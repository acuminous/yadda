/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Yadda = require('../lib/index');
var Interpreter = Yadda.Interpreter;
var Counter = require('./Counter');

describe('Localisation', function() {

    it('should support German', function () {
        var counter = new Counter();
        var library = Yadda.localisation.German.library()
            .given('some text 1', counter.count)
            .when('some text 2', counter.count)
            .then('some text 4', counter.count);

        new Interpreter(library).interpret([
            'angenommen some text 1',
            'wenn some text 2',
            'dann some text 4'
        ]);

        assert.equal(counter.total(), 3);
    });

    it('should support French', function() {
        var counter = new Counter();
        var library = Yadda.localisation.French.library()
            .soit('some text 1', counter.count)
            .etantdonnees('some text 2', counter.count)
            .etantdonnee('some text 3', counter.count)
            .etantdonne('some text 4', counter.count)
            .given('some text 5', counter.count)

            .quand('some text 6', counter.count)
            .lorsque('some text 7', counter.count)
            .when('some text 8', counter.count)

            .alors('some text 9', counter.count)
            .then('some text 10', counter.count);

        new Interpreter(library).interpret([
            'soit some text 1',
            'étant données some text 2',
            'étant donnée some text 3',
            'étant donné some text 4',
            'soit some text 5',

            'quand some text 6',
            'lorsque some text 7',
            'quand some text 8',

            'alors some text 9',
            'alors some text 10'
        ]);

        assert.equal(counter.total(), 10);
    });

    it('should support Norwegian', function() {
        var counter = new Counter();
        var library = Yadda.localisation.Norwegian.library()
            .gitt('some text 1', counter.count)
            .given('some text 2', counter.count)

            .når('some text 3', counter.count)
            .when('some text 4', counter.count)

            .så('some text 5', counter.count)
            .then('some text 6', counter.count);


        new Interpreter(library).interpret([
            'gitt some text 1',
            'gitt some text 2',

            'når some text 3',
            'når some text 4',

            'så some text 5',
            'så some text 6'
        ]);

        assert.equal(counter.total(), 6);
    });

    it('should support Piracy', function() {
        var counter = new Counter();
        var library = Yadda.localisation.Pirate.library()
            .giveth('some text 1', counter.count)
            .given('some text 2', counter.count)

            .whence('some text 3', counter.count)
            .when('some text 4', counter.count)

            .thence('some text 5', counter.count)
            .then('some text 6', counter.count);

        new Interpreter(library).interpret([
            'giveth some text 1',
            'giveth some text 2',

            'whence some text 3',
            'whence some text 4',

            'thence some text 5',
            'thence some text 6'
        ]);

        assert.equal(counter.total(), 6);
    });

    it('should support Polish', function() {
        var counter = new Counter();
        var library = Yadda.localisation.Polish.library()
            .zakladajac('some text 1', counter.count)
            .majac('some text 2', counter.count)
            .given('some text 3', counter.count)

            .jezeli('some text 4', counter.count)
            .jesli('some text 5', counter.count)
            .gdy('some text 6', counter.count)
            .kiedy('some text 7', counter.count)
            .when('some text 8', counter.count)

            .wtedy('some text 9', counter.count)
            .then('some text 10', counter.count);

        new Interpreter(library).interpret([
            'zakładając some text 1',
            'mając some text 2',
            'zakładając some text 3',

            'jeżeli some text 4',
            'jeśli some text 5',
            'gdy some text 6',
            'kiedy some text 7',
            'jeżeli some text 8',

            'wtedy some text 9',
            'wtedy some text 10'
        ]);

        assert.equal(counter.total(), 10);
    });

    it('should support Spanish', function() {
        var counter = new Counter();
        var library = Yadda.localisation.Spanish.library()
            .sea('some text 1', counter.count)
            .sean('some text 2', counter.count)
            .dado('some text 3', counter.count)
            .dada('some text 4', counter.count)
            .dados('some text 5', counter.count)
            .dadas('some text 6', counter.count)
            .given('some text 7', counter.count)

            .cuando('some text 8', counter.count)
            .si('some text 9', counter.count)
            .when('some text 10', counter.count)

            .entonces('some text 11', counter.count)
            .then('some text 12', counter.count);

        new Interpreter(library).interpret([
            'sea some text 1',
            'sean some text 2',
            'dado some text 3',
            'dada some text 4',
            'dados some text 5',
            'dadas some text 6',
            'sea some text 7',

            'cuando some text 8',
            'si some text 9',
            'cuando some text 10',

            'entonces some text 11',
            'entonces some text 12'
        ]);

        assert.equal(counter.total(), 12);
    });

    it('should support Russian', function() {
        var counter = new Counter();
        var library = Yadda.localisation.Russian.library()
            .given('some text 1', counter.count)
            .when('some text 2', counter.count)
            .then('some text 4', counter.count);

        new Interpreter(library).interpret([
            'допустим some text 1',
            'если some text 2',
            'то some text 4'
        ]);

        assert.equal(counter.total(), 3);
    });
});
