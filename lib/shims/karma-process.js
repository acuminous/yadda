
module.exports = (function() {

    "use strict";

    var fs = require("./karma-fs");
    var process = {};

    process.cwd = function() {
        return fs.workingDirectory;
    };

    return process;

})();
