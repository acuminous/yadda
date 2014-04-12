var fn = require('./fn');
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands how to invoke a step
var Macro = function(signature, signature_pattern, macro, macro_context) {

    var signature_pattern = new RegularExpression(signature_pattern);
    var macro = macro || fn.async_noop;
    var event_bus = EventBus.instance();
    var _this = this;

    var init = function(signature, signature_pattern) {
        _this.signature = normalise(signature);
    };

    this.is_identified_by = function(other_signature) {
        return this.signature == normalise(other_signature);
    };

    this.can_interpret = function(step) {
        return signature_pattern.test(step);
    };

    this.interpret = function(step, scenario_context, next) {
        var context = new Context().merge(macro_context).merge(scenario_context);
        var args = signature_pattern.groups(step);
        event_bus.send(EventBus.ON_EXECUTE, {
            step: step,
            ctx: context.properties,
            pattern: signature_pattern.toString(),
            args: args
        });
        fn.invoke(macro, context.properties, args.concat(next));
    };

    this.levenshtein_signature = function() {
        return signature_pattern.without_expressions();
    };

    var normalise = function(signature) {
        return new RegExp(signature).toString();
    };

    this.toString = function() {
        return this.signature;
    };

    init(signature, signature_pattern);
};

module.exports = Macro;
