var assert = require('assert');
var Yadda = require('../lib/index');
var Interpreter = Yadda.Interpreter;
var Counter = require('./Counter');

describe('Localisation', function() {

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
})