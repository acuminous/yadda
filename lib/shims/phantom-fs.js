module.exports = (function() {
    if (module.client) {
        // Running in browser, not via node
        return {}; // short-circuit;
    }

    var fs = require('fs');

    fs.existsSync = fs.existsSync || fs.exists;

    fs.readdirSync = fs.readdirSync || function(path) {
        return fs.list(path).filter(function(name) {
            return name != '.' && name != '..';
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
