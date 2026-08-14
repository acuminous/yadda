const fn = require('./fn');
const $ = require('./Array');
const Context = require('./Context');
const RegularExpression = require('./RegularExpression');
const EventBus = require('./EventBus');

// Understands how to invoke a step
const Macro = function (signature, parsed_signature, macro = fn.async_noop, macro_context, library, options = {}) {
  signature = normalise(signature);
  const signature_pattern = new RegularExpression(parsed_signature.pattern);
  const event_bus = EventBus.instance();

  this.library = library;

  this.is_identified_by = (other_signature) => signature === normalise(other_signature);

  this.can_interpret = (step) => signature_pattern.test(step);

  this.interpret = (step, scenario_context, next) => {
    const context = new Context({ step: step }).merge(macro_context).merge(scenario_context);
    convert(signature_pattern.groups(step), (err, args) => {
      if (err) return next(err);
      event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
      let result;
      try {
        result = fn.invoke(macro, context.properties, is_sync(args) ? args : args.concat(next));
      } catch (err) {
        if (next) return next(err);
        throw err;
      }
      if (is_promise(result)) return result.then(fn.noargs(next)).catch(next);
      if (is_sync(args)) return next?.();
    });
  };

  this.is_sibling = (other_macro) => other_macro?.defined_in(library);

  this.defined_in = (other_library) => library === other_library;

  this.levenshtein_signature = () => signature_pattern.without_expressions();

  this.toString = () => signature;

  function is_promise(result) {
    if (options.mode) return options.mode === 'promise';
    return result?.then;
  }

  function is_sync(args) {
    if (options.mode) return options.mode === 'sync';
    return macro !== fn.async_noop && macro.length !== args.length + 1;
  }

  function normalise(signature) {
    return new RegExp(signature).toString();
  }

  function convert(args, next) {
    let index = 0;
    return $(parsed_signature.converters)
      .collect((converter) => (callback) => {
        converter.apply(null, args.slice(index, (index += converter.length - 1)).concat(callback));
      })
      .collect_async((converter, index, callback) => {
        converter(callback);
      }, next);
  }

  event_bus.send(EventBus.ON_DEFINE, { signature: signature, pattern: signature_pattern.toString() });
};

module.exports = Macro;
