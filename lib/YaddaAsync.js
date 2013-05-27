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
var YaddaAsync = function(libraries, ctx) {

    this.interpreter = new Interpreter(libraries);
    var environment = new Environment(ctx);
    var before = fnUtils.async_noop;
    var after = fnUtils.async_noop;
    var _this = this;    

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(script, ctx, next) {        
        if (script == undefined) return this;
        if (arguments.length == 2 && fnUtils.is_function(ctx)) {
            next = ctx;            
            ctx = undefined;
        };
        run(script, environment.merge(ctx), next);        
    };

    var run = function(script, env, next) {
        before.call(env.ctx, null, function(err) {
            if (err) return next(err);
            _this.interpreter.interpretAsync(script, env.ctx, function(err) {                
                after.call(env.ctx, err, function(err) {
                    if (err) return next(err);
                    next();
                });
            });
        });
    };

    this.before = function(fn) {
        before = fn;
        return this;
    };

    this.after = function(fn) {
        after = fn;
        return this;
    };

    this.toString = function() {
        "Yadda 0.4.0 Copyright 2010 Acuminous Ltd / Energized Work Ltd";
    };   
};

module.exports = YaddaAsync;
