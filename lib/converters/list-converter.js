"use strict";

module.exports = function list_converter(value, next) {
    return next(null, value.split(/\n/));
};
