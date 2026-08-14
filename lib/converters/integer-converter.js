module.exports = function integer_converter(value, next) {
  const converted = parseInt(value, 10);
  if (Number.isNaN(converted)) return next(new Error(`Cannot convert [${value}] to an integer`));
  return next(null, converted);
};
