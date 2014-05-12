/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Yadda = require('../lib/index');
var Interpreter = Yadda.Interpreter;
var EventBus = Yadda.EventBus;
var Library = Yadda.Library;
var Dictionary = Yadda.Dictionary;
var Context = Yadda.Context;
var Counter = require('./Counter');

describe('Interpreter', function() {

    it('should interpret a single line script', function() {

        var counter = new Counter();
        var library = new Library().define('Blah blah blah', counter.count);

        new Interpreter(library).interpret('Blah blah blah');

        assert.equal(counter.total(), 1);
    });

    it('should interpret a multiline script', function() {

        var counter = new Counter();
        var library = new Library().define('Blah blah blah', counter.count);

        new Interpreter(library).interpret([
            'Blah blah blah',
            'Blah blah blah'
        ]);

        assert.equal(counter.total(), 2);
    });

    it('should validate scenarios', function() {
        var counter = new Counter();
        var library = new Library().define('This is defined').define(/[Tt]his is ambiguous/).define(/[tT]his is ambiguous/);

        assert.throws(function() {
            new Interpreter(library).validate([
                'This is defined',
                'This is undefined',
                'This is ambiguous'
            ]);
        }, /Scenario cannot be interpreted\nThis is defined\nThis is undefined <-- Undefined Step\nThis is ambiguous <-- Ambiguous Step/);

    });

    it('should utilise macros from different libraries', function() {

        var counter = new Counter();
        var library_1 = new Library().define('Blah blah blah', counter.count);
        var library_2 = new Library().define('Whatever', counter.count);

        new Interpreter([library_1, library_2]).interpret([
            'Blah blah blah',
            'Whatever'
        ]);

        assert.equal(counter.total(), 2);
    });

    it('should expanded terms to discern macros', function() {

        var patient_name;

        var dictionary = new Dictionary()
            .define('gender', '(male|female)')
            .define('speciality', '(cardio|elderly care)');

        var library = new Library(dictionary)
            .define('Given a $gender patient called $name', function(gender, name) { patient_name = name; })
            .define('Given a $speciality patient called $name', function(speciality, name) { patient_name = name; });

        new Interpreter(library).interpret('Given a female patient called Carol');
        assert.equal('Carol', patient_name);

        new Interpreter(library).interpret('Given a cardio patient called Bobby');
        assert.equal('Bobby', patient_name);
    });

    it('should report undefined steps', function() {

        var library = new Library();
        var interpreter = new Interpreter(library);

        assert.throws(function() {
            interpreter.interpret('Blah blah blah');
        }, /Undefined Step: \[Blah blah blah\]/);
    });

    it('should interpret steps asynchronously', function(done) {

        var counter = new Counter();
        var library = new Library().define('Blah blah blah', counter.count);

        new Interpreter(library).interpret([
            'Blah blah blah',
            'Blah blah blah'
        ], {}, function() {
            assert.equal(counter.total(), 2);
            done();
        });
    });

    it('should bind the context to the macro', function(done) {

        var context = new Context({foo: 'bar'});
        var library = new Library().define('Blah blah blah', function(next) {
            assert.equal(this.foo, 'bar');
            next();
        });

        new Interpreter(library).interpret([
            'Blah blah blah',
            'Blah blah blah'
        ], context, done);

    });

    it('should notify listeners of interpreter events', function(done) {

        var library = new Library().define('Blah blah blah');
        var interpreter = new Interpreter(library);
        var listener = new Listener();
        EventBus.instance().on(/STEP|SCENARIO/, listener.listen);

        interpreter.interpret('Blah blah blah', new Context({ foo: 'bar' }));

        assert.equal(2, listener.events.length);

        assert_event({
            name: EventBus.ON_SCENARIO,
            data: { scenario: 'Blah blah blah', ctx: { foo: 'bar' }}
        }, listener.events[0]);

        assert_event({
            name: EventBus.ON_STEP,
            data: { step: 'Blah blah blah', ctx: { foo: 'bar' }}
        }, listener.events[1]);

        done();
    });

    function Listener() {
        var _this = this;
        this.events = [];
        this.listen = function(event) {
            _this.events.push(event);
        };
    }

    function assert_event(expected, actual) {
        assert.ok(actual);
        assert.equal(expected.name, actual.name);
        assert.deepEqual(expected.data, actual.data);
    }
});
