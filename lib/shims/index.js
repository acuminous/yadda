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

module.exports = (function() {

    var shims = {
        node: function() {
            return {
                fs: require('fs'),
                path: require('path'),
                process: process
            }
        },
        phantom: function() {
            return {
                fs: require('./phantom-fs'),
                path: require('./phantom-path'),
                process: require('./phantom-process')
            }
        }
    }

    function is_node() {
        return typeof global != 'undefined' &&
               typeof global.process != 'undefined' &&
               global.process.title == 'node';
    }

    function is_phantom() {
        return typeof phantom;
    }

    function get_shim() {
        if (is_node()) return shims.node();

        if (is_phantom()) return shims.phantom();
        throw new Error('Unsupported Platform');
    }

    return get_shim();
})();
