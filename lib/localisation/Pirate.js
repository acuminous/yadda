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

var Library = require('../Library');
var localisation = require('../localisation')
var $ = require('../Array');
   
var Pirate = function(dictionary, library) {
        
    var library = library ? library : new Library(dictionary);

    library.given = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.when = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = localisation.prefix_signature('(?:[Ww]hilst|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.then = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Tt]hence|[Dd]emand|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    function prefix_signature(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix);
    };

    return library;     
};

module.exports = Pirate;