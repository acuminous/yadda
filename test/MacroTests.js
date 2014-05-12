/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Macro = require('../lib/Macro');
var Context = require('../lib/Context');
var EventBus = require('../lib/EventBus');
var $ = require('../lib/Array');
var fn = require('../lib/fn');

describe('Macro', function() {

    it('should interpret a line of text', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];

        new Macro('Easy', /Easy as (\d), (\d), (\d)/, execution.code, {a: 1}).interpret("Easy as 1, 2, 3", new Context({b: 2}), fn.noop);

        assert.ok(execution.executed, "The step code was not run");
        assert.deepEqual(execution.args.splice(0, 3), [1, 2, 3]);
        assert.deepEqual(execution.ctx, {a: 1, b: 2});
    });

    it('should provide a signature that can be used to compare levenshtein distance', function() {
        $([
            /the quick brown fox/,
            /the quick.* brown.* fox/,
            /the quick(.*) brown(?:.*) fox/,
            /the quick[xyz] brown[^xyz] fox/,
            /the quick{0,1} brown{1} fox/,
            /the quick\d brown\W fox/
        ]).each(function(signature) {
            assert.equal(new Macro('Quick brown fox', signature).levenshtein_signature(), 'the quick brown fox');
        });
    });

    it('should default to a no operation function', function(done) {
        new Macro('blah $a', /blah (.*)/).interpret('blah 1', {}, function() {
            done();
        });
    });


    it('should notify listeners of macro events', function(done) {

        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];
        var listener = new Listener();

        EventBus.instance().on(/EXECUTE/, listener.listen);

        new Macro('Easy', /Easy as (\d), (\d), (\d)/, fn.noop, {a: 1}).interpret("Easy as 1, 2, 3", {b: 2});

        assert.equal(1, listener.events.length);

        var event = listener.events[0];
        assert.equal(event.name, EventBus.ON_EXECUTE);
        assert.equal(event.data.step, 'Easy as 1, 2, 3');
        assert.deepEqual(event.data.ctx, {a: 1, b: 2});
        assert.equal(event.data.pattern, "/Easy as (\\d), (\\d), (\\d)/");
        assert.deepEqual(event.data.args.slice(), ["1", "2", "3"]);
        done();
    });

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
