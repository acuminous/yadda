test('Yadda API', function() {
    var executions = 0;
    var library = new Yadda.Library().define('foo', function() { executions++;});
    var yadda = new Yadda.yadda(library).yadda('foo');
    equal(executions, 1);
});