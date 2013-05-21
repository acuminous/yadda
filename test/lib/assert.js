module.exports = (function() {

    var assert = require('assert');

    assert.raises = function(fn, pattern) {
        try {
            fn();
            assert(false, 'Expected exception not thrown');
        } catch(e) {
            assert.ok(pattern.test(e), 'Incorrect exception thrown: ' + e + ' != ' + pattern);
        };
    };

    return assert;

})();