test('Yadda interprets scenarios', function() {
    var executions = 0;
    var library = new Yadda.Library().define('foo', function() { executions++ });
    var yadda = new Yadda.yadda(library).yadda('foo');
    equal(executions, 1);
});

test('After is always even when a scenario fails', function() {
    var executions = 0;
    var yadda = new Yadda.yadda().after(function() { executions++ });

    raises(function() {
        yadda.yadda('Blah blah blah');
    }, /Undefined Step: \[Blah blah blah\]/);

    equal(executions, 1); 
});