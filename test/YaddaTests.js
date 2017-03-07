"use strict";

var assert = require('assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').Yadda;

describe('Yadda', function() {

    it('should interpret synchronous scenarios', function() {
        var executions = 0;
        var library = new Library().define('foo', function() { executions++; });
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

    it('should interpret a mix of asynchronous and synchronous scenarios', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function(next) {
            executions++;
            next();
        }).define('bar', function() {
            executions++;
        });
        new Yadda(library).yadda(['foo', 'bar'], function(err) {
            assert.ifError(err);
            assert.equal(executions, 2);
            done();
        });
    });

    it('should interpret asynchronous returning promises', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function() {
            executions++;
            return {
                then: function(cb) {
                    cb();
                    return {
                        catch: function() {}
                    };
                }
            };
        });
        new Yadda(library).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });

    it('should interpret asynchronous returning promises', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function() {
            executions++;
            return {
                then: function(cb) {
                    cb();
                    return {
                        catch: function() {}
                    };
                }
            };
        });
        new Yadda(library).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });

    it('should cater for people who dont find the recursive api amusing', function() {
        var Yadda = require('../lib/index');
        var executions = 0;
        var library = new Yadda.Library().define('foo', function() { executions++; });
        var yadda = Yadda.createInstance(library);
        yadda.run('foo');
        assert.equal(executions, 1);
    });

    it('should interpret asynchronous variadic steps', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function() {
            var next = arguments[arguments.length - 1];
            assert.equal(typeof next, 'function');
            executions++;
            next();
        }, {}, { mode: 'async' });
        new Yadda(library).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });

    it('should interpret asynchronous localised variadic steps', function(done) {
        var executions = 0;
        var English = require('../lib').localisation.English;
        var library = new English.library().given('foo', function() {
            var next = arguments[arguments.length - 1];
            assert.equal(typeof next, 'function');
            executions++;
            next();
        }, {}, { mode: 'async' });

        new Yadda(library).yadda('Given foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });
});
