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
 
var fn = require('./fn');
var Environment = require('./Environment');
var RegularExpression = require('./RegularExpression');

// Understands a step
var Macro = function(signature, signature_pattern, macro, ctx) {    
    
    var environment = new Environment(ctx);
    var signature_pattern = new RegularExpression(signature_pattern);
    var macro = macro || fn.async_noop;
    var _this = this;    

    var init = function(signature, signature_pattern) {
        _this.signature = normalise(signature);
    }

    this.is_identified_by = function(other_signature) {
        return this.signature == normalise(other_signature);        
    }; 

    this.can_interpret = function(step) {
        return signature_pattern.test(step);
    };  

    this.interpret = function(step, ctx, callback) {    
        var env = environment.merge(ctx);
        var args = signature_pattern.groups(step).concat(callback); 
        return fn.invoke(macro, env.ctx, args);
    };

    this.levenshtein_signature = function() {
        return signature_pattern.without_expressions();            
    };

    var normalise = function(signature) {
        return new RegExp(signature).toString();
    }

    this.toString = function() {
        return this.signature;
    };

    init(signature, signature_pattern);
};

module.exports = Macro;
