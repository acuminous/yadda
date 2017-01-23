
module.exports = (function () {

    "use strict";

    var path = {};

    try {
        path = require('path');
    } catch (e) {
        throw new Error("The environment does not support the path module, it's probably not using browserify.");
    }

    if (typeof path.normalize !== "function" || typeof path.dirname !== "function")
        throw new Error("The path module emulation does not contain implementations of required functions.");

    return path;

})();
