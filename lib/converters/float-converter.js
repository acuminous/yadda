module.exports = function float_converter(value, next) {
  const converted = parseFloat(value);
  if (Number.isNaN(converted)) return next(new Error(`Cannot convert [${value}] to a float`));
  return next(null, converted);
};
