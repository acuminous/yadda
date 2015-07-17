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
        var SURROUNDING_WHITESPACE_REGEX = /^\s+|\s+$/g;
        return text.replace(SURROUNDING_WHITESPACE_REGEX, '');
    },
    isBlank: function isBlank(text) {
        var ALL_WHITESPACE_REGEX = /^\s*$/g;
        return ALL_WHITESPACE_REGEX.test(text);
    },
    isNotBlank: function isNotBlank(text) {
        return !this.isBlank(text);
    },
    indentation: function indentation(text) {
        var LEADING_WHITESPACE_REGEX = /^(\s*)/;
        var match = LEADING_WHITESPACE_REGEX.exec(text)
        return match && match[0].length || 0
    }
};
