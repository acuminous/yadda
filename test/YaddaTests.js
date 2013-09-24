var assert = require('./lib/assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').Yadda;
var Interpreter = require('../lib/index').Interpreter;
var $ = require('../lib/Array');

describe('Yadda', function() {
    it('should interpret synchronous scenarios', function() {
        var executions = 0;
        var library = new Library().define('foo', function() { executions++ });
        new Yadda(library).yadda('foo');
        assert.equal(executions, 1);
    });

    it('should interpret asynchronous scenarios', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function(next) { 
            executions++;
            next();
        });
        new Yadda(library).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });

    it('should re-emit Interpreter events', function() {
        var library = new Library().define('Blah blah blah');
        var event_names = [Interpreter.BEFORE_SCENARIO, Interpreter.AFTER_SCENARIO, Interpreter.BEFORE_STEP, Interpreter.AFTER_STEP];
        var events_emitted = 0;
        
        $(event_names).each(function(event_name) {
            var yadda = new Yadda(library).on(event_name, assert_event).yadda('Blah blah blah');        

            function assert_event(actual) {
                assert.equal(event_name, actual.name);
                events_emitted++;
            };
        })

        assert.equal(event_names.length, events_emitted);
    });
});