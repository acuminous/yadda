test('Interpreter can interpret a single line script', function() {

    var executions = 0;
    var library = new Yadda.Library().define('Blah blah blah', function() { executions++; });

    new Yadda.Interpreter(library).interpret('Blah blah blah');

    equal(executions, 1);
});

test('Interpreter can interpret a multiline script', function() {

    var executions = 0;
    var library = new Yadda.Library().define('Blah blah blah', function() { executions++; });

    new Yadda.Interpreter(library).interpret([
        'Blah blah blah',
        'Blah blah blah'
    ]);

    equal(executions, 2);
});

test('Interpreter can utilise macros from different libraries', function() {

    var executions = 0;

    var library_1 = new Yadda.Library().define('Blah blah blah', function() { executions++; });
    var library_2 = new Yadda.Library().define('Whatever', function() { executions++; });

    new Yadda.Interpreter([library_1, library_2]).interpret([
        'Blah blah blah',
        'Whatever'
    ]);

    equal(executions, 2);
});

test('Interpreter uses expanded terms to discern macros', function() {

    var patient_name;

    var dictionary = new Yadda.Dictionary()
        .define('gender', '(male|female)')
        .define('speciality', '(cardio|elderly care)');

    var library = new Yadda.Library(dictionary)
        .define('Given a $gender patient called $name', function(gender, name) { patient_name = name })
        .define('Given a $speciality patient called $name', function(speciality, name) { patient_name = name });

    new Yadda.Interpreter(library).interpret('Given a female patient called Carol');
    equal('Carol', patient_name);

    new Yadda.Interpreter(library).interpret('Given a cardio patient called Bobby');
    equal('Bobby', patient_name);
});

test('Interpreter reports undefined steps', function() {

    var library = new Yadda.Library();

    var interpreter = new Yadda.Interpreter(library);

    raises(function() {
        interpreter.interpret('Blah blah blah');
    }, /Undefined Step: \[Blah blah blah\]/);
});