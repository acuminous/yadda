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

var Library = require('../Library');
var $ = require('../Array');

module.exports = function(name, vocabulary) {

    var _this = this;

    this.library = function(dictionary) {
        return _this.localise_library(new Library(dictionary));
    };

    this.localise_library = function(library) {
        $(vocabulary._steps).each(function(keyword) {
            library[keyword] = function(signatures, fn, ctx) {
                return $(signatures).each(function(signature) {
                    signature = prefix_signature(_this.localise(keyword), signature);
                    return library.define(signature, fn, ctx);
                });
            };
        });
        return library;
    };

    var prefix_signature = function(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        var one_or_more_spaces = '\\s+';
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix + one_or_more_spaces);
    };

    this.localise = function(keyword) {
        if (vocabulary[keyword] === undefined) throw new Error('Keyword "' + keyword + '" has not been translated into ' + name + '.');
        return vocabulary[keyword];
    };
};
