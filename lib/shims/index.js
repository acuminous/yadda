"use strict";

var Platform = require('../Platform');

module.exports = (function () {

    var platform = new Platform();

    var shims = {
        node: function () {
            return {
                fs: require('fs'),
                path: require('path'),
                process: process
            };
        },
        phantom: function () {
            return {
                fs: require('./phantom-fs'),
                path: require('./phantom-path'),
                process: require('./phantom-process')
            };
        },
        karma: function () {
            return {
                fs: require('./karma-fs'),
                path: require('./karma-path'),
                process: require('./karma-process')
            };
        }
    };

    function get_shim() {
        if (platform.is_phantom()) return shims.phantom();
        if (platform.is_browser() && platform.is_karma()) return shims.karma();
        if (platform.is_node()) return shims.node();
        return {};
    }

    return get_shim();
})();
