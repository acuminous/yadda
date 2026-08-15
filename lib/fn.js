module.exports = (() => {
  const slice = Array.prototype.slice;

  function curry(ctx, fn) {
    const args = slice.call(arguments, 2);
    return function () {
      return fn.apply(ctx, args.concat(slice.call(arguments)));
    };
  }

  function invoke(fn, ctx, args) {
    return fn.apply(ctx, args);
  }

  function is_function(object) {
    const getType = {};
    return object && getType.toString.call(object) === '[object Function]';
  }

  function is_async(fn) {
    return !!fn && !!fn.constructor && fn.constructor.name === 'AsyncFunction';
  }

  function arity(fn) {
    return is_async(fn) ? fn.length : fn.length - 1;
  }

  function noop() {}

  function noargs(fn) {
    return () => fn();
  }

  function asynchronize(ctx, fn) {
    return function () {
      const next = slice.call(arguments, arguments.length - 1)[0];
      const args = slice.call(arguments, 0, arguments.length - 2);
      fn.apply(ctx, args);
      if (next) next();
    };
  }

  return {
    noop: noop,
    noargs: noargs,
    async_noop: asynchronize(null, noop),
    asynchronize: asynchronize,
    is_function: is_function,
    is_async: is_async,
    arity: arity,
    curry: curry,
    invoke: invoke,
  };
})();
