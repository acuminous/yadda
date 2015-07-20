module.exports = function float_converter(value, next) {
    return next(null, new Date(value));
}