module.exports = function integer_converter(value, next) {
    return next(null, parseInt(value));
}