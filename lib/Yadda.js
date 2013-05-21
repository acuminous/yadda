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

var Interpreter = require('./Interpreter');
var Environment = require('./Environment');
var fnUtils = require('./fnUtils');

// Provides a repetitive interface, i.e. new Yadda().yadda().yadda() interface to the Yadda Interpreter
var Yadda = function(libraries, ctx) {

    this.interpreter = new Interpreter(libraries);
    var environment = new Environment(ctx);
    var before = fnUtils.NO_OP;
    var after = fnUtils.NO_OP;
    var _this = this;    

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(script, ctx) {
        if (script == undefined) return this;
        run(script, environment.merge(ctx));        
    };

    var run = function(script, env) {
        fnUtils.invoke(before, env.ctx);
        try {
            _this.interpreter.interpret(script, env.ctx);
        } finally {
            fnUtils.invoke(after, env.ctx);
        }        
    }

    this.before = function(fn) {
        before = fn;
        return this;
    };

    this.after = function(fn) {
        after = fn;
        return this;
    };

    this.toString = function() {
        "Yadda 0.3.0 Copyright 2010 Acuminous Ltd / Energized Work Ltd";
    };   
};

module.exports = Yadda;
