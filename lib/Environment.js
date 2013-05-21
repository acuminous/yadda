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

// Understands a macros execution context
var Environment = function(ctx) {

    this.ctx = {};
    this._merge_on = 'ctx';

    this.merge = function(other) {
        other = get_item_to_merge(other);
        return new Environment(this.ctx)._merge(other);
    };

    var get_item_to_merge = function(other) {
        if (!other) return {};
        return other._merge_on ? other[other._merge_on] : other;
    };

    this._merge = function(other_ctx) {
        for (var key in other_ctx) { this.ctx[key] = other_ctx[key] }; 
        return this;
    };

    this._merge(ctx);
};

module.exports = Environment;