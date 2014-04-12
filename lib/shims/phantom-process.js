module.exports = (function() {
    if (module.client) {
        // Running in browser, not via node
        return {}; // short-circuit;
    }

    var fs = require('fs');
    var process = typeof process != 'undefined' ? process : {};

    process.cwd = function() {
        return fs.workingDirectory;
    };

    return process;

})();
