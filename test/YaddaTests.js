var assert = require('./lib/assert');
var Library = require('../lib/index').Library;
var Yadda = require('../lib/index').Yadda;

describe('Yadda', function() {

    it('should interpret scenarios', function() {
        var executions = 0;
        var library = new Library().define('foo', function() { executions++ });
        new Yadda(library).yadda('foo');
        assert.equal(executions, 1);
    });

    it('should still execute after when a scenario fails', function() {
        var executions = 0;
        var yadda = new Yadda().after(function() { executions++ });

        assert.raises(function() {
            yadda.yadda('Blah blah blah');
        }, /Undefined Step: \[Blah blah blah\]/);

        assert.equal(executions, 1); 
    });

});