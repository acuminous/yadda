/*
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
"use strict";

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
        },
    };

    function get_shim() {
        if (platform.is_phantom()) return shims.phantom();
        if (platform.is_node()) return shims.node();
        return {};
    }

    return get_shim();
})();
