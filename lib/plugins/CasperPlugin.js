/*
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* jslint node: true */
"use strict";

if (!module.client) {
    var fs = require('fs');
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
