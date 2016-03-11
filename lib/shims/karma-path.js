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

/* jslint node: false */
"use strict";

module.exports = (function () {

    var path = {};

    try {
        path = require('path');
    } catch (e) {
        throw new Error("The environment does not support the path module, it's probably not using browserify.");
    }

    if (typeof path.normalize != "function" || typeof path.dirname != "function")
        throw new Error("The path module emulation does not contain implementations of required functions.");

    return path;

})();
