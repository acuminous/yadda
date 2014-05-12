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
    var terms = {};
    var term_pattern = new RegularExpression(new RegExp('(?:^|[^\\\\])\\' + prefix + '(\\w+)', 'g'));
    var _this = this;

    this.define = function(term, definition) {
        if (this.is_defined(term)) throw new Error('Duplicate definition: [' + term + ']');
        terms[term] = normalise(definition);
        return this;
    };

    this.is_defined = function(term) {
        return terms[term];
    };

    this.expand = function(term, already_expanding) {
        if (!is_expandable(term)) return term;
        return expand_sub_terms(term, $(already_expanding));
    };

    this.merge = function(other) {
        if (other._prefix() != this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');
        return new Dictionary(prefix)._merge(this)._merge(other);
    };

    this._merge = function(other) {
        other.each_term(this.define.bind(this));
        return this;
    };

    this._prefix = function() {
        return prefix;
    };

    this.each_term = function(callback) {
        for (var key in terms) {
            callback(key, terms[key]);
        }
    };

    var expand_sub_terms = function(term, already_expanding) {
        return get_sub_terms(term).each(function(sub_term) {
            if (already_expanding.in_array(sub_term)) throw new Error('Circular Definition: [' + already_expanding.join(', ') + ']');
            var sub_term_definition = expand_sub_term(sub_term, already_expanding);
            term = term.replace(prefix + sub_term, sub_term_definition);
            return term;
        });
    };

    var get_sub_terms = function(term) {
        return term_pattern.groups(term);
    };

    var expand_sub_term = function(sub_term, already_expanding) {
        var definition = terms[sub_term] || '(.+)';
        return is_expandable(definition) ? _this.expand(definition, already_expanding.concat(sub_term)) : definition;
    };

    var normalise = function(definition) {
        return definition.toString().replace(/^\/|\/$/g, '');
    };

    var is_expandable = function(definition) {
        return term_pattern.test(definition);
    };
};


module.exports = Dictionary;
