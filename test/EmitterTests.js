var assert = require('assert');
var Emitter = require('../lib/Emitter');

describe('Emitter', function() {
    it('should attach a listener to the specified event', function() {
        var emitter = new Emitter();
        var counter = new Counter();
        emitter.on('foo', counter.count)
        emitter.emit('foo');
        assert.equal(counter.getCount(), 1);
    });

    it('should attach multiple listeners to the same event', function() {
        var emitter = new Emitter();
        var counter = new Counter();
        emitter.on('foo', counter.count)
        emitter.on('foo', counter.count)
        emitter.emit('foo');
        assert.equal(counter.getCount(), 2);
    }); 

    it('should remove the specified listener', function() {
        var emitter = new Emitter();
        var counter = new Counter();
        var id = emitter.on('foo', counter.count)
        emitter.emit('foo');
        assert.equal(counter.getCount(), 1);
        emitter.off(id);
        emitter.emit('foo');
        assert.equal(counter.getCount(), 1);        
    }); 

    function Counter() {
        var count = 0;
        this.count = function() { 
            count++;
        };
        this.getCount = function() {
            return count;
        };
    }
});