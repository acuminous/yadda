var Interpreter = require('./Interpreter');
var Context = require('./Context');
var fn = require('./fn');

// Provides a repetitive interface, i.e. new Yadda().yadda().yadda()
// to the Yadda Interpreter
var Yadda = function(libraries, interpreter_context) {

    this.interpreter = new Interpreter(libraries);
    var _this = this;

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(scenario, scenario_context, next) {
        if (arguments.length == 0)
            return this;
        if (arguments.length == 2 && fn.is_function(scenario_context))
            return this.yadda(scenario, {}, scenario_context);
        this.interpreter.validate(scenario);
        this.interpreter
            .interpret(
                scenario,
                new Context().merge(interpreter_context).merge(scenario_context),
                next
            );
    };

    this.toString = function() {
        return 'Yadda 0.10.7 Copyright 2010 Acuminous Ltd / Energized Work Ltd';
    };
};

module.exports = Yadda;
