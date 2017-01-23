"use strict";

module.exports = (function() {
    if (module.client) return {}; // Running in browser, not via node

    var fs = require('fs');
    var process = typeof process !== 'undefined' ? process : {};

    process.cwd = function() {
        return fs.workingDirectory;
    };

    return process;

})();
