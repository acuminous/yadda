var assert = require('assert');
var Environment = require('../lib/Environment');

describe('Environment', function() {

    it("should merge contexts", function() {
        assert_merge_ctx({a: 1}, undefined, {a: 1});
        assert_merge_ctx({a: 1}, null, {a: 1});
        assert_merge_ctx({a: 1}, {}, {a: 1});
        assert_merge_ctx({a: 1}, {b: 2}, {a: 1, b:2});
        assert_merge_ctx({a: 1}, {a: 2}, {a: 2});
    });

    it("should merge environments", function() {      
        assert.deepEqual(
            new Environment({a: 1}).merge(new Environment({b: 2})).ctx, 
            new Environment({a:1, b: 2}).ctx
        );
    });

    var assert_merge_ctx = function(thing1, thing2, expected) {
        assert.deepEqual(new Environment(thing1).merge(thing2).ctx, expected);
    }
});