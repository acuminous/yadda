module.exports = function date_converter(value, next) {
  const converted = Date.parse(value);
  if (Number.isNaN(converted)) return next(new Error(`Cannot convert [${value}] to a date`));
  return next(null, new Date(converted));
};
