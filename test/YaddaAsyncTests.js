var assert = require('./lib/assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').YaddaAsync;

describe('YaddaAsync', function() {

    it('should interpret scenarios', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function() { 
            executions++;
            this.done();
        });
        new Yadda(library).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(executions, 1);
            done();
        });
    });

    it('should run before and after', function(done) {
        var order = [];
        var library = new Library().define('foo', function() { 
            order.push('scenario');
            this.done();
        });
        var yadda = new Yadda(library)
        yadda.before(function(err, next) {
            order.push('before');
            next();
        }).after(function(err, next) {
            order.push('after');
            next();
        }).yadda('foo', function(err) {
            assert.ifError(err);
            assert.equal(order[0], 'before');
            assert.equal(order[1], 'scenario');
            assert.equal(order[2], 'after');
            done();
        });
    });

    it('should still execute after when a scenario fails', function(done) {
        var executions = 0;
        var library = new Library().define('foo', function() { 
            this.done('Some Error');
        });        
        var yadda = new Yadda(library).after(function(err, next) { 
            assert.equal(err, 'Some Error');            
            executions++;
            next(err);
        }).yadda('foo', function(err) {
            assert.equal(err, 'Some Error');
            assert.equal(executions, 1);
            done();
        });
    });
  });