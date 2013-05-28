var assert = require('assert');   
var Macro = require('../lib/Macro');
var $ = require('../lib/Array');

describe('Macro', function() {

    it('should interpret a line of text', function() {
        var execution = new Execution();
        var args = [1, 2, 3, 'callback'];    

        new Macro('Easy', /Easy as (\d), (\d), (\d)/, execution.code, {a: 1}).interpret("Easy as 1, 2, 3", {b: 2}, 'callback');

        assert.ok(execution.executed, "The step code was not run");
        assert.equal(execution.args.toString(), args.toString(), "The step code was not passed the correct arguments");    
        assert.deepEqual(execution.ctx, {a: 1, b: 2}, "The step code was not run in the correct context");
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
    })

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
            _this.args = this.toArray(args)
        };
        this.toArray = function(obj) {
            return [].slice.call(obj, 0);        
        };
    };

});