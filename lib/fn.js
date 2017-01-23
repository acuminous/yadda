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

    function noargs(fn) {
        return function() {
            return fn();
        };
    }

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
        noargs: noargs,
        async_noop: asynchronize(null, noop),
        asynchronize: asynchronize,
        is_function: is_function,
        curry: curry,
        invoke: invoke
    };


})();
