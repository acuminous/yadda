"use strict";

if (!module.client) {
    var fs = require("../shims").fs;
    global.process = global.process || {
        cwd: function() {
            return fs.workingDirectory;
        }
    };
}


module.exports = function(yadda, casper) {

    var EventBus = require('yadda').EventBus;

    yadda.interpreter.interpret_step = function(step, ctx, next) {

        var _this = this;
        casper.then(function() {
            casper.test.info(step);
            EventBus.instance().send(EventBus.ON_STEP, { step: step, ctx: ctx });
            _this.rank_macros(step).clear_winner().interpret(step, ctx, next);
        });
    };

    casper.yadda = function(script, ctx) {
        if (script === undefined) return this;
        yadda.run(script, ctx);
    };
};
