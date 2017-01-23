"use strict";

module.exports = function date_converter(value, next) {
    var converted = Date.parse(value);
    if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to a date'));
    return next(null, new Date(converted));
};
