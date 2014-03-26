var Platform = require('../Platform');

module.exports = (function() {

    var platform = new Platform();

    var shims = {
        node: function() {
            return {
                fs: require('fs'),
                path: require('path'),
                process: process
            };
        },
        phantom: function() {
            return {
                fs: require('./phantom-fs'),
                path: require('./phantom-path'),
                process: require('./phantom-process')
            };
        }
    };

    function get_shim() {
        if (platform.is_phantom()) return shims.phantom();
        if (platform.is_node()) return shims.node();

        throw new Error('Unsupported Platform');
    }

    return get_shim();
})();
