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

module.exports = {

    trim: function trim(text) {
        return text.replace(/^\s+|\s+$/g, '');
    },
    rtrim: function rtrim(text) {
        return text.replace(/\s+$/g, '');
    },
    isBlank: function isBlank(text) {
        return /^\s*$/g.test(text);
    },
    isNotBlank: function isNotBlank(text) {
        return !this.isBlank(text);
    },
    indentation: function indentation(text) {
        var match = /^(\s*)/.exec(text);
        return match && match[0].length || 0;
    }
};
