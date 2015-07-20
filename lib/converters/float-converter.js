module.exports = function float_converter(value, next) {
    return next(null, parseFloat(value));
}