/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Macro = require('../lib/Macro');
var Context = require('../lib/Context');
var EventBus = require('../lib/EventBus');
var Dictionary = require('../lib/Dictionary');
var $ = require('../lib/Array');
var fn = require('../lib/fn');

describe('Macro', function() {

    it('should interpret a line of text', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];

        new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.code, {a: 1}).interpret("Easy as 1, 2, 3", new Context({b: 2}), fn.noop);

        assert.ok(execution.executed, "The step code was not run");
        assert.deepEqual(execution.args.splice(0, 3), [1, 2, 3]);
        assert.deepEqual(execution.ctx, {a: 1, b: 2, step: 'Easy as 1, 2, 3'});
    });

    it('should include step name in the context', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];

        new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.code, {a: 1}).interpret("Easy as 1, 2, 3", new Context({b: 2}), fn.noop);

        assert.equal(execution.ctx.step, 'Easy as 1, 2, 3');
    });

    it('should not override step name in the context if explicitly set', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];

        new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), execution.code, {a: 1}).interpret("Easy as 1, 2, 3", new Context({b: 2, step: 'Do not override'}), fn.noop);

        assert.equal(execution.ctx.step, 'Do not override');
    });

    it('should provide a signature that can be used to compare levenshtein distance', function() {
        $([
            /the quick brown fox/,
            /the quick.* brown.* fox/,
            /the quick(.*) brown(?:.*) fox/,
            /the quick[xyz] brown[^xyz] fox/,
            /the quick{0,1} brown{1} fox/,
            /the quick\d brown\W fox/
        ]).each(function(pattern) {
            assert.equal(new Macro('Quick brown fox', parsed_signature(pattern)).levenshtein_signature(), 'the quick brown fox');
        });
    });

    it('should default to a no operation function', function(done) {
        new Macro('blah $a', parsed_signature(/blah (.*)/)).interpret('blah 1', {}, function() {
            done();
        });
    });

    it('should notify listeners of execute events', function(done) {

        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];
        var listener = new Listener();

        EventBus.instance().on(/EXECUTE/, listener.listen);

        new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, {a: 1}).interpret("Easy as 1, 2, 3", {b: 2});

        assert.equal(1, listener.events.length);

        var event = listener.events[0];
        assert.equal(event.name, EventBus.ON_EXECUTE);
        assert.equal(event.data.step, 'Easy as 1, 2, 3');
        assert.deepEqual(event.data.ctx, {a: 1, b: 2, step: 'Easy as 1, 2, 3'});
        assert.equal(event.data.pattern, "/Easy as (\\d), (\\d), (\\d)/");
        assert.deepEqual(event.data.args.slice(), ["1", "2", "3"]);
        done();
    });

    it('should notify listeners of define events', function(done) {

        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];
        var listener = new Listener();

        EventBus.instance().on(/DEFINE/, listener.listen);

        new Macro('Easy', parsed_signature(/Easy as (\d), (\d), (\d)/), fn.noop, {a: 1}).interpret("Easy as 1, 2, 3", {b: 2});

        assert.equal(1, listener.events.length);

        var event = listener.events[0];
        assert.equal(event.name, EventBus.ON_DEFINE);
        assert.equal(event.data.pattern, "/Easy as (\\d), (\\d), (\\d)/");
        done();
    });

    it('should interpret a multiline', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];

        new Macro('Easy', parsed_signature(/Easy as ([^\u0000]*)/), execution.code, {a: 1}).interpret("Easy as 1\n2\n3", new Context({b: 2}), fn.noop);

        assert.ok(execution.executed, "The step code was not run");
        assert.deepEqual(execution.args.splice(0, 1), ["1\n2\n3"]);
        assert.deepEqual(execution.ctx, {a: 1, b: 2, step: 'Easy as 1\n2\n3'});
    });

    it('should convert parameters', function() {
        var execution = new Execution();

        new Macro('Easy', { pattern: /Easy as (\d), (\d), (\d)/, converters: [
            function(value, cb) { cb(null, value * 2); },
            function(value, cb) { cb(null, value * 3); },
            function(value, cb) { cb(null, value * 4); }
        ]}, execution.code, {a: 1}).interpret("Easy as 1, 2, 3", fn.noop);

        assert.ok(execution.executed, "The step code was not run");
        assert.deepEqual(execution.args.splice(0, 3), [2, 6, 12]);
    });

    it('should convert parameters with multi-arg converters', function() {
        var execution = new Execution();

        new Macro('Easy', { pattern: /Easy as (\d), (\d), (\d), (\d)/, converters: [
            function(value, cb) { cb(null, value * 2); },
            function(value1, value2, cb) { cb(null, parseInt(value1) + parseInt(value2)); },
            function(value, cb) { cb(null, value * 3); }
        ]}, execution.code, {a: 1}).interpret("Easy as 1, 2, 3, 4", fn.noop);

        assert.ok(execution.executed, "The step code was not run");
        assert.deepEqual(execution.args.splice(0, 3), [2, 5, 12]);
     });

    function parsed_signature(pattern) {
        return new Dictionary().define('foo', pattern).expand('$foo');
    }


    function Execution() {

        this.executed = false;
        this.args = undefined;
        this.ctx = undefined;
        var _this = this;

        this.code = function() {
            _this.executed = true;
            _this.captureArguments(arguments);
            _this.ctx = this;
        };
        this.captureArguments = function(args) {
            _this.args = this.toArray(args);
        };
        this.toArray = function(obj) {
            return [].slice.call(obj, 0);
        };
    }

    function Listener() {
        var _this = this;
        this.events = [];
        this.listen = function(event) {
            _this.events.push(event);
        };
    }
});
