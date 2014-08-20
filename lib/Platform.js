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
/* jslint browser: true */
/* jslint phantom: true */
"use strict";

module.exports = Platform;

function Platform() {

    function get_container() {
        if (is_browser()) return window;
        if (is_phantom()) return phantom;
        if (is_node()) return global;
    }

    function is_node() {
        return typeof process != 'undefined' &&
               typeof GLOBAL != 'undefined' &&
               typeof __dirname != 'undefined';
    }

    function is_browser() {
        return typeof window != 'undefined';
    }

    function is_phantom() {
        return typeof phantom != 'undefined';
    }

    return {
        get_container: get_container,
        is_node: is_node,
        is_browser: is_browser,
        is_phantom: is_phantom
    };

}
