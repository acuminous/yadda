"use strict";

module.exports = function pass_through_converter(value, next) {
    return next(null, value);
};
