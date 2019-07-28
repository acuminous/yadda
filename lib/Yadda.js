/*jslint node: true */
"use strict";

var Interpreter = require('./Interpreter');
var Context = require('./Context');
var fn = require('./fn');

var Yadda = function(libraries, interpreter_context) {

    if (!(this instanceof Yadda)) {
        return new Yadda(libraries, interpreter_context);
    }

    this.interpreter = new Interpreter(libraries);

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(scenario, scenario_context, next) {
        if (arguments.length === 0) return this;
        if (arguments.length === 2 && fn.is_function(scenario_context)) return this.yadda(scenario, {}, scenario_context);
        this.interpreter.validate(scenario);
        this.interpreter.interpret(scenario, new Context().merge(interpreter_context).merge(scenario_context), next);
    };

    // Not everyone shares my sense of humour re the recursive api :(
    // See https://github.com/acuminous/yadda/issues/111
    this.run = this.yadda;

    this.toString = function() {
        return "Yadda 2.1.0 Copyright 2010 Stephen Cresswell / Energized Work Ltd";
    };
};

module.exports = Yadda;
