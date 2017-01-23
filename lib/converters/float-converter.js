"use strict";

module.exports = function float_converter(value, next) {
    var converted = parseFloat(value);
    if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to a float'));
    return next(null, converted);
};
