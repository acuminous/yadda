"use strict";

module.exports = (function() {
    if (module.client) return {}; // Running in browser, not via node

    var fs = require('fs');

    fs.existsSync = fs.existsSync || fs.exists;

    fs.readdirSync = fs.readdirSync || function(path) {
        return fs.list(path).filter(function(name) {
            return name !== '.' && name !== '..';
        });
    };

    fs.statSync = fs.statSync || function(path) {
        return {
            isDirectory: function() {
                return fs.isDirectory(path);
            }
        };
    };

    return fs;
})();
