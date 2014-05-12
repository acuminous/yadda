/* jslint node: true */
/* global describe, it */
"use strict";

var assert = require('assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').Yadda;
var Interpreter = require('../lib/index').Interpreter;
var $ = require('../lib/Array');

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
});
