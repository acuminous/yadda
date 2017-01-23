
"use strict";

module.exports = (function() {
    if (module.client) return {}; // Running in browser, not via node

    var fs = require('fs');
    var path = {};

    try {
        path = require('path');
    } catch (e) {
        // meh
    }

    path.join = path.join || function() {
        return Array.prototype.join.call(arguments, fs.separator);
    };

    path.relative = path.relative || function(from, to) {
        return from + fs.separator + to;
    };

    return path;

})();
