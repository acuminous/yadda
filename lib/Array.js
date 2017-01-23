"use strict";

var fn = require('./fn');

module.exports = function(obj) {

    function ensure_array(obj) {
        var array = obj ? [].concat(obj) : [];
        array.in_array = fn.curry(array, in_array, array);
        array.each = fn.curry(array, each, array);
        array.each_async = fn.curry(array, each_async, array);
        array.collect = fn.curry(array, collect, array);
        array.collect_async = fn.curry(array, collect_async, array);
        array.flatten = fn.curry(array, flatten, array);
        array.inject = fn.curry(array, inject, array);
        array.push_all = fn.curry(array, push_all, array);
        array.fill = fn.curry(array, fill, array);
        array.find_all = fn.curry(array, find_all, array);
        array.find = fn.curry(array, find, array);
        array.last = fn.curry(array, last, array);
        array.naked = fn.curry(array, naked, array);
        return array;
    }

    function is_array(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    function in_array(items, item) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] === item) {
                return true;
            }
        }
    }

    function flatten(items) {
        if (!is_array(items)) return [items];
        if (items.length === 0) return items;
        var head = flatten(items[0]);
        var tail = flatten(items.slice(1));
        return ensure_array(head.concat(tail));
    }

    function each(items, iterator) {
        var result;
        for (var i = 0; i < items.length; i++) {
            result = iterator(items[i], i);
        }
        return result;
    }

    function each_async(items, iterator, callback) {
        callback = callback || fn.noop;
        if (!items.length) return callback();
        var index = 0;
        var iterate = function() {
            iterator(items[index], index, function(err, result) {
                if (err) return callback(err);
                if (++index >= items.length) return callback(null, result);
                iterate();
            });
        };
        iterate();
    }

    function collect(items, iterator) {
        var results = ensure_array();
        for (var i = 0; i < items.length; i++) {
            results.push(iterator(items[i], i));
        }
        return results;
    }

    function collect_async(items, iterator, callback) {
        var results = ensure_array();
        each_async(items, function(item, index, each_callback) {
            iterator(item, index, function(err) {
                if (err) return each_callback(err);
                results.push_all(Array.prototype.splice.call(arguments, 1));
                each_callback();
            });
        }, function(err) {
            if (err) return callback(err);
            callback(null, results);
        });
    }

    function inject(items, default_value, iterator) {
        var result = default_value;
        for (var i = 0; i < items.length; i++) {
            result = iterator(result, items[i]);
        }
        return result;
    }

    function push_all(items, more_items) {
        more_items = more_items ? [].concat(more_items) : [];
        for (var i = 0; i < more_items.length; i++) {
            items.push(more_items[i]);
        }
        return items;
    }

    function fill(items, item, num) {
        for (var i = 0; i < num; i++) {
            items.push(item);
        }
        return items;
    }

    function find_all(items, test) {
        var results = ensure_array();
        for (var i = 0; i < items.length; i++) {
            if (test(items[i], i)) {
                results.push(items[i]);
            }
        }
        return results;
    }

    function find(items, test) {
        var result;
        for (var i = 0; i < items.length; i++) {
            if (test(items[i], i)) {
                result = items[i];
                break;
            }
        }
        return result;
    }

    function last(items) {
        return items[items.length - 1];
    }

    function naked(items) {
        return [].concat(items);
    }

    return ensure_array(obj);
};
