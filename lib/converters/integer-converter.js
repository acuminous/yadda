"use strict";

module.exports = function integer_converter(value, next) {
    var converted = parseInt(value);
    if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to an integer'));
    return next(null, converted);
};
