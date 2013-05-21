var assert = require('./lib/assert');
var Interpreter = require('../lib/index').Interpreter;
var Library = require('../lib/index').Library;
var Dictionary = require('../lib/index').Dictionary;

describe('Interpreter', function() {

    it('should interpret a single line script', function() {

        var executions = 0;
        var library = new Library().define('Blah blah blah', function() { executions++; });

        new Interpreter(library).interpret('Blah blah blah');

        assert.equal(executions, 1);
    });

    it('should interpret a multiline script', function() {

        var executions = 0;
        var library = new Library().define('Blah blah blah', function() { executions++; });

        new Interpreter(library).interpret([
            'Blah blah blah',
            'Blah blah blah'
        ]);

        assert.equal(executions, 2);
    });

    it('should utilise macros from different libraries', function() {

        var executions = 0;

        var library_1 = new Library().define('Blah blah blah', function() { executions++; });
        var library_2 = new Library().define('Whatever', function() { executions++; });

        new Interpreter([library_1, library_2]).interpret([
            'Blah blah blah',
            'Whatever'
        ]);

        assert.equal(executions, 2);
    });

    it('should expanded terms to discern macros', function() {

        var patient_name;

        var dictionary = new Dictionary()
            .define('gender', '(male|female)')
            .define('speciality', '(cardio|elderly care)');

        var library = new Library(dictionary)
            .define('Given a $gender patient called $name', function(gender, name) { patient_name = name })
            .define('Given a $speciality patient called $name', function(speciality, name) { patient_name = name });

        new Interpreter(library).interpret('Given a female patient called Carol');
        assert.equal('Carol', patient_name);

        new Interpreter(library).interpret('Given a cardio patient called Bobby');
        assert.equal('Bobby', patient_name);
    });

    it('should report undefined steps', function() {

        var library = new Library();

        var interpreter = new Interpreter(library);

        assert.raises(function() {
            interpreter.interpret('Blah blah blah');
        }, /Undefined Step: \[Blah blah blah\]/);
    });

})
