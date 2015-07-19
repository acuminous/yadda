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

var $ = require('./Array');
var RegularExpression = require('./RegularExpression');

// Understands term definitions
var Dictionary = function(prefix) {

    /* jslint shadow: true */
    var prefix = prefix || '$';
    var definitions = {};
    var term_pattern = new RegularExpression(new RegExp('(?:^|[^\\\\])\\' + prefix + '(\\w+)', 'g'));
    var _this = this;

    this.define = function(term, pattern) {
        if (this.is_defined(term)) throw new Error('Duplicate term: [' + term + ']');
        definitions[term] = { pattern: normalise(pattern) };
        return this;
    };

    this.is_defined = function(term) {
        return !!definitions[term];
    };

    this.merge = function(other) {
        if (other._prefix() != this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');
        return new Dictionary(prefix)._merge(this)._merge(other);
    };

    this._merge = function(other) {
        other.each(function(term, definition) {
            _this.define(term, definition.pattern);
        });
        return this;
    };

    this._prefix = function() {
        return prefix;
    };

    this.each = function(callback) {
        for (var term in definitions) {
            callback(term, definitions[term]);
        }
    };

    this.expand = function(text, already_expanding) {
        if (!is_expandable(text)) return { pattern: text };
        return { pattern: expand_sub_terms(text, $(already_expanding)) };
    };

    var expand_sub_terms = function(text, already_expanding) {
        return get_sub_terms(text).each(function(sub_term) {
            if (already_expanding.in_array(sub_term)) throw new Error('Circular Definition: [' + already_expanding.join(', ') + ']');
            var sub_term_pattern = expand_sub_term(sub_term, already_expanding);
            text = text.replace(prefix + sub_term, sub_term_pattern);
            return text;
        });
    };

    var get_sub_terms = function(text) {
        return term_pattern.groups(text);
    };

    var expand_sub_term = function(sub_term, already_expanding) {
        var pattern = definitions[sub_term] ? definitions[sub_term].pattern : '(.+)';
        return is_expandable(pattern) ? _this.expand(pattern, already_expanding.concat(sub_term)).pattern : pattern;
    };

    var normalise = function(pattern) {
        return pattern.toString().replace(/^\/|\/$/g, '');
    };

    var is_expandable = function(text) {
        return term_pattern.test(text);
    };
};


module.exports = Dictionary;
