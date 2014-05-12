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

module.exports = (function() {

    var slice = Array.prototype.slice;

    function curry(ctx, fn) {
        var args = slice.call(arguments, 2);
        return function() {
            return fn.apply(ctx, args.concat(slice.call(arguments)));
        };
    }

    function invoke(fn, ctx, args) {
        return fn.apply(ctx, args);
    }

    function is_function(object) {
        var getType = {};
        return object && getType.toString.call(object) === '[object Function]';
    }

    function noop() {}

    function asynchronize(ctx, fn) {
        return function() {
            var next = slice.call(arguments, arguments.length - 1)[0];
            var args = slice.call(arguments, 0, arguments.length - 2);
            fn.apply(ctx, args);
            if (next) next();
        };
    }

    return {
        noop: noop,
        async_noop: asynchronize(null, noop),
        asynchronize: asynchronize,
        is_function: is_function,
        curry: curry,
        invoke: invoke
    };


})();
