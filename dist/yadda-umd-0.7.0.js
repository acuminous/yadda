!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.yaddaumd=e():"undefined"!=typeof global?global.yaddaumd=e():"undefined"!=typeof self&&(self.yaddaumd=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

module.exports = function(obj) {

    function ensure_array(obj) {
        var array = obj ? [].concat(obj) : [];
        array.in_array = fn.curry(array, in_array, array);
        array.each = fn.curry(array, each, array);
        array.each_async = fn.curry(array, each_async, array);
        array.collect = fn.curry(array, collect, array);
        array.flatten = fn.curry(array, flatten, array);
        array.inject = fn.curry(array, inject, array);
        array.push_all = fn.curry(array, push_all, array);
        array.find_all = fn.curry(array, find_all, array);
        array.find = fn.curry(array, find, array);
        array.naked = fn.curry(array, naked, array);
        return array;
    };

    function is_array(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]'        
    };

    function in_array(items, item) {
        for (var i = 0; i < items.length; i++) {
            if (items[i] == item) {                
                return true;
            }
        }
    };

    function flatten(items) {
        if (!is_array(items)) return [items]; 
        if (items.length == 0) return [];    
        var head = flatten(items[0]);
        var tail = flatten(items.slice(1));
        return ensure_array(head.concat(tail));
    };

    function each(items, iterator) { 
        var result;
        for (var i = 0; i < items.length; i++) {
            result = iterator(items[i], i);
        };
        return result;
    };

    function each_async(items, iterator, callback) { 
        callback = callback || fn.noop;
        if (!items.length) return callback();
        var completed = 0;
        var iterate = function() {
            iterator(items[completed], completed, function(err, result) {
                if (err) return callback(err);
                if (++completed >= items.length) return callback(null, result);
                iterate();
            });
        };
        iterate();
    };    

    function collect(items, iterator) {
        var results = ensure_array();
        for (var i = 0; i < items.length; i++) {
            results.push(iterator(items[i]));
        }
        return results;
    };

    function inject(items, default_value, iterator) {
        var result = default_value;
        for (var i = 0; i < items.length; i++) {
            result = iterator(result, items[i]);            
        }
        return result;
    };

    function push_all(items, more_items) {
        var more_items = more_items ? [].concat(more_items) : [];
        for (var i = 0; i < more_items.length; i++) {
            items.push(more_items[i]);
        }        
    };

    function find_all(items, test) {
        var results = ensure_array();
        for (var i = 0; i < items.length; i++) {
            if (test(items[i])) {
                results.push(items[i]);
            }
        };
        return results;
    };

    function find(items, test) {        
        var result;
        for (var i = 0; i < items.length; i++) {
            if (test(items[i])) {
                result = items[i];                
                break;
            }
        };
        return result;
    };

    function naked(items) {
        return [].concat(items);
    };

    return ensure_array(obj);
};
},{"./fn":12}],2:[function(require,module,exports){
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

var LevenshteinDistanceScore = require('./LevenshteinDistanceScore');
var $ = require('./Array');

// Understands appropriateness of macros in relation to a specific step
var Competition = function(step, macros) {

    var results = [];
    var by_ascending_score = function(a, b) { return b.score.beats(a.score); };
    var FIRST_PLACE = 0;
    var SECOND_PLACE = 1;

    this.clear_winner = function() {
        if (number_of_competitors() == 0) throw new Error('Undefined Step: [' + step + ']');
        if (joint_first_place()) throw new Error('Ambiguous Step: [' + step + ']');
        return this.winner();
    };   

    var number_of_competitors = function() {
        return results.length;
    };

    var joint_first_place = function() {
        return (number_of_competitors() > 1) && 
            results[FIRST_PLACE].score.equals(results[SECOND_PLACE].score); 
    };

    this.winner = function() {
        return results[FIRST_PLACE].macro;
    };

    var rank = function(step, macros) {
        results = macros.collect(function(macro) {
            return { 
                macro: macro, 
                score: new LevenshteinDistanceScore(step, macro.levenshtein_signature())
            }
        }).sort( by_ascending_score );
    };

    rank(step, $(macros));
};

module.exports = Competition;
},{"./Array":1,"./LevenshteinDistanceScore":7}],3:[function(require,module,exports){
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

// Constructs an object that macros will be bound to before execution
var Context = function(properties) {

    this.properties = {};

    this.merge = function(other) {
        if (other instanceof Context) return this.merge(other.properties);
        return new Context(this.properties)._merge(other);
    };

    this._merge = function(other) {
        for (var key in other) { this.properties[key] = other[key] }; 
        return this;
    };

    this._merge(properties);
};

module.exports = Context;
},{}],4:[function(require,module,exports){
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

var $ = require('./Array');
var RegularExpression = require('./RegularExpression');

// Understands definitions of terms
var Dictionary = function(prefix) {

    var prefix = prefix || '$';
    var terms = {};
    var term_pattern = new RegularExpression(new RegExp('(?:^|[^\\\\])\\' + prefix + '(\\w+)', 'g'));
    var _this = this;

    this.define = function(term, definition) {
        if (this.is_defined(term)) throw new Error('Duplicate definition: [' + term + ']');
        terms[term] = normalise(definition);
        return this;
    };

    this.is_defined = function(term) {
        return terms[term];
    };

    this.expand = function(term, already_expanding) {
        if (!is_expandable(term)) return term;
        return expand_sub_terms(term, $(already_expanding));
    };

    this.merge = function(other) {
        if (other._prefix() != this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');
        return new Dictionary(prefix)._merge(this)._merge(other);
    };

    this._merge = function(other) {
        other.each_term(this.define.bind(this));
        return this;
    };

    this._prefix = function() {
        return prefix;
    };

    this.each_term = function(callback) {
        for (key in terms) {
            callback(key, terms[key])
        };
    };

    var expand_sub_terms = function(term, already_expanding) {
        return get_sub_terms(term).each(function(sub_term) {
            if (already_expanding.in_array(sub_term)) throw new Error('Circular Definition: \[' + already_expanding.join(', ') + '\]');
            var sub_term_definition = expand_sub_term(sub_term, already_expanding);
            return term = term.replace(prefix + sub_term, sub_term_definition);
        });
    };

    var get_sub_terms = function(term) {
        return term_pattern.groups(term);
    }

    var expand_sub_term = function(sub_term, already_expanding) {
        var definition = terms[sub_term] || '(.+)';
        return is_expandable(definition) ? _this.expand(definition, already_expanding.concat(sub_term)) : definition;
    }

    var normalise = function(definition) {
        return definition.toString().replace(/^\/|\/$/g, '');
    }

    var is_expandable = function(definition) {
        return term_pattern.test(definition);
    };
};


module.exports = Dictionary;
},{"./Array":1,"./RegularExpression":10}],5:[function(require,module,exports){
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

var $ = require('./Array');
var fn = require('./fn');
var event_bus = new EventBus();

// A communication channel between event emitters and event listeners
function EventBus() {

    var event_handlers = $();
    var _this = this;

    this.send = function(event_name, event_data, next) {
        if (arguments.length == 1) return this.send(event_name, {});
        if (arguments.length == 2 && fn.is_function(event_data)) return this.send(event_name, {}, event_data);      
        notify_handlers(event_name, event_data);
        next && next();        
        return this;
    };

    this.on = function(event_pattern, callback) {
        event_handlers.push({ pattern: event_pattern, callback: callback });
        return this;
    };

    var notify_handlers = function(event_name, event_data) {
        find_handlers(event_name).each(function(callback) {
            callback({ name: event_name, data: event_data });
        });
    };

    var find_handlers = function(event_name) {
        return event_handlers.find_all(function(handler) {
            return new RegExp(handler.pattern).test(event_name);
        }).collect(function(handler) {
            return handler.callback;
        });
    };  
};

function instance() {
    return event_bus;
};

module.exports = {
    instance: instance,
    ON_SCENARIO: '__ON_SCENARIO__',
    ON_STEP: '__ON_STEP__',
    ON_EXECUTE: '__ON_EXECUTE__'
};
},{"./Array":1,"./fn":12}],6:[function(require,module,exports){
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

var Competition = require('./Competition');
var Context = require('./Context');
var EventBus = require('./EventBus');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function(libraries) {

    var libraries = $(libraries);
    var event_bus = EventBus.instance();
    var _this = this;

    this.requires = function(libraries) {
        libraries.push_all(libraries);
        return this;
    };

    this.interpret = function(scenario, scenario_context, next) {
        scenario_context = new Context().merge(scenario_context);
        event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });        
        var iterator = make_step_iterator(scenario_context, next);
        $(scenario).each_async(iterator, next);
    };

    var make_step_iterator = function(scenario_context, next) {
        var iterator = function(step, index, callback) {
            _this.interpret_step(step, scenario_context, callback);
        };
        return next ? iterator : fn.asynchronize(null, iterator);        
    };

    this.interpret_step = function(step, scenario_context, next) {
        var context = new Context().merge(scenario_context);
        event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });        
        _this.rank_macros(step).clear_winner().interpret(step, context || {}, next);
    };  

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step));
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };
};

module.exports = Interpreter;
},{"./Array":1,"./Competition":2,"./Context":3,"./EventBus":5,"./fn":12}],7:[function(require,module,exports){
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

// Understands similarity of two strings
var LevenshteinDistanceScore = function(s1, s2) {

    this.value;
    this.type = 'LevenshteinDistanceScore';    
    var distance_table;
    var _this = this;

    var initialise = function() {

        var x = s1.length;
        var y = s2.length;

        distance_table = new Array(x + 1);

        for (i = 0; i <= x; i++) {
            distance_table[i] = new Array(y + 1);
        }

        for (var i = 0; i <= x; i++) {
            for (var j = 0; j <= y; j++) {
                distance_table[i][j] = 0;
            }
        }

        for (var i = 0; i <= x; i++) {
            distance_table[i][0] = i;
        }

        for (var j = 0; j <= y; j++) {
            distance_table[0][j] = j;
        }
    };

    var score = function() {

        if (s1 == s2) return _this.value = 0;

        for (var j = 0; j < s2.length; j++) {
            for (var i = 0; i < s1.length; i++) {
                if (s1[i] == s2[j]) {
                    distance_table[i+1][j+1] = distance_table[i][j];
                } else {
                    var deletion = distance_table[i][j+1] + 1;
                    var insertion = distance_table[i+1][j] + 1;
                    var substitution = distance_table[i][j] + 1;
                    distance_table[i+1][j+1] = Math.min(substitution, deletion, insertion)
                }
            }
        }
        _this.value = distance_table[s1.length][s2.length];
    };

    this.beats = function(other) {
        return this.value < other.value;
    } 

    this.equals = function(other) {
        if (!other) return false;
        return (this.type == other.type && this.value == other.value);
    }   

    initialise();
    score();
};

module.exports = LevenshteinDistanceScore;
},{}],8:[function(require,module,exports){
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

var Macro = require('./Macro');
var Dictionary = require('./Dictionary');
var $ = require('./Array');

// Understands how to index macros
var Library = function(dictionary) {

    var dictionary = dictionary || new Dictionary();
    var macros = $();
    var _this = this;    

    this.define = function(signatures, fn, macro_context) {
        $(signatures).each(function(signature) {            
            define_macro(signature, fn, macro_context);
        });
        return this;        
    };

    var define_macro = function(signature, fn, macro_context) {
        if (_this.get_macro(signature)) throw new Error('Duplicate macro: [' + signature + ']');
        macros.push(new Macro(signature, dictionary.expand(signature), fn, macro_context));
    }

    this.get_macro = function(signature) {      
        return macros.find(function(other_macro) {
            return other_macro.is_identified_by(signature);
        });
    };

    this.find_compatible_macros = function(step) {
        return macros.find_all(function(macro) {
            return macro.can_interpret(step);
        });
    };
};

module.exports = Library;
},{"./Array":1,"./Dictionary":4,"./Macro":9}],9:[function(require,module,exports){
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
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands a step
var Macro = function(signature, signature_pattern, macro, macro_context) {    
    
    var signature_pattern = new RegularExpression(signature_pattern);
    var macro = macro || fn.async_noop;
    var event_bus = EventBus.instance();
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

    this.interpret = function(step, scenario_context, next) {   
        var context = new Context().merge(macro_context).merge(scenario_context);
        var args = signature_pattern.groups(step);
        event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
        fn.invoke(macro, context.properties, args.concat(next));            
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

},{"./Context":3,"./EventBus":5,"./RegularExpression":10,"./fn":12}],10:[function(require,module,exports){
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
 
var $ = require('./Array');

// Wrapper for JavaScript Regular Expressions
var RegularExpression = function(pattern_or_regexp) {

    var groups_pattern = /(^|[^\\\\])\(.*?\)/g;
    var sets_pattern = /(^|[^\\\\])\[.*?\]/g;
    var repetitions_pattern = /(^|[^\\\\])\{.*?\}/g;
    var regex_aliases_pattern = /(^|[^\\\\])\\./g;
    var non_word_tokens_pattern = /[^\w\s]/g;
    var regexp = new RegExp(pattern_or_regexp);

    this.test = function(text) {
        var result = regexp.test(text);
        this.reset();        
        return result;
    };  

    this.groups = function(text) {
        var results = $();
        var match = regexp.exec(text);
        while (match) {            
            var groups = match.slice(1, match.length);
            results.push(groups)
            match = regexp.global && regexp.exec(text)
        }
        this.reset();
        return results.flatten();        
    };   

    this.reset = function() {
        regexp.lastIndex = 0;
        return this;
    };

    this.without_expressions = function() {
        return regexp.source.replace(groups_pattern, '$1')
                            .replace(sets_pattern, '$1')
                            .replace(repetitions_pattern, '$1')
                            .replace(regex_aliases_pattern, '$1')
                            .replace(non_word_tokens_pattern, '');
    };    

    this.equals = function(other) {
        return this.toString() == other.toString();
    };    

    this.toString = function() {
        return "/" + regexp.source + "/";
    };
};

module.exports = RegularExpression;
},{"./Array":1}],11:[function(require,module,exports){
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
var Context = require('./Context');
var fn = require('./fn');

// Provides a repetitive interface, i.e. new Yadda().yadda().yadda() to the Yadda Interpreter
var Yadda = function(libraries, interpreter_context) {

    this.interpreter = new Interpreter(libraries);
    var _this = this;

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(scenario, scenario_context, next) {
        if (arguments.length == 0) return this;
        if (arguments.length == 2 && fn.is_function(scenario_context)) return this.yadda(scenario, {}, scenario_context);
        this.interpreter.interpret(scenario, new Context().merge(interpreter_context).merge(scenario_context), next);
    };

    this.toString = function() {
        return "Yadda 0.7.0 Copyright 2010 Acuminous Ltd / Energized Work Ltd";
    };
};

module.exports = Yadda;

},{"./Context":3,"./Interpreter":6,"./fn":12}],12:[function(require,module,exports){
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

module.exports = (function() {

    var slice = Array.prototype.slice;

    function curry(ctx, fn) {
        var args = slice.call(arguments, 2);
        return function() {
            return fn.apply(ctx, args.concat(slice.call(arguments)));
        }
    };

    function invoke(fn, ctx, args) {
        return fn.apply(ctx, args);
    };

    function is_function(object) {
        var getType = {};
        return object && getType.toString.call(object) === '[object Function]';
    };

    function noop() {};

    function asynchronize(ctx, fn) {
        return function() {
            var next = slice.call(arguments, arguments.length - 1)[0];
            var args = slice.call(arguments, 0, arguments.length - 2);
            fn.apply(ctx, args);
            if (next) next();
        };
    };

    return {
        noop: noop,
        async_noop: asynchronize(null, noop), 
        asynchronize: asynchronize,
        is_function: is_function,
        curry: curry,
        invoke: invoke
    };


})();

},{}],"yadda":[function(require,module,exports){
module.exports=require('W+dgdo');
},{}],"W+dgdo":[function(require,module,exports){
module.exports = {    
    Yadda: require('./Yadda'),
    EventBus: require('./EventBus'),
    Interpreter: require('./Interpreter'),    
    Context: require('./Context'),    
    Library: require('./Library'),    
    Dictionary: require('./Dictionary'),
    localisation: require('./localisation/index'),
    parsers: require('./parsers/index'),
    plugins: require('./plugins/index')
};

},{"./Context":3,"./Dictionary":4,"./EventBus":5,"./Interpreter":6,"./Library":8,"./Yadda":11,"./localisation/index":17,"./parsers/index":20,"./plugins/index":23}],15:[function(require,module,exports){
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

var Library = require('../Library');
var $ = require('../Array');

var English = function(dictionary, library) {

    var library = library ? library : new Library(dictionary);

    library.given = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.when = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.then = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    function prefix_signature(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix);
    };

    return library;
};

module.exports = English;
},{"../Array":1,"../Library":8}],16:[function(require,module,exports){
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

var Library = require('../Library');
var localisation = require('../localisation')
var $ = require('../Array');
   
var Pirate = function(dictionary, library) {
        
    var library = library ? library : new Library(dictionary);

    library.given = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.when = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = localisation.prefix_signature('(?:[Ww]hilst|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    library.then = function(signatures, fn, ctx) {
        return $(signatures).each(function(signature) {
            var signature = prefix_signature('(?:[Tt]hence|[Dd]emand|[Aa]nd|[Bb]ut) ', signature);
            return library.define(signature, fn, ctx);
        });
    };

    function prefix_signature(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix);
    };

    return library;     
};

module.exports = Pirate;
},{"../Array":1,"../Library":8,"../localisation":17}],17:[function(require,module,exports){
module.exports = {
    English: require('./English'),
    Pirate: require('./Pirate')

}
},{"./English":15,"./Pirate":16}],18:[function(require,module,exports){
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

var $ = require('../Array');

var FeatureParser = function() {

    var FEATURE_REGEX = /^\s*Feature:\s*(.*)/i;
    var SCENARIO_REGEX = /^\s*Scenario:\s*(.*)/i;
    var STEP_REGEX = /^\s*([^\s].*)/;
    var NON_BLANK_REGEX = /[^\s]/;
    var SIMPLE_ANNOTATION_REGEX = /^@([^=]*)$/;
    var NVP_ANNOTATION_REGEX = /^@([^=]*)=(.*)$/;

    var feature;
	var annotations;

    this.parse = function(text, next) {
        feature = undefined; annotations = {};
        split(text).each(parse_line);
        return next && next(feature) || feature;
    };

    var split = function(text) {
		return $(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

    var parse_line = function(line) {
        var match;
        if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return annotations[match[1]] = true;
		if (match = NVP_ANNOTATION_REGEX.exec(line)) return annotations[match[1]] = match[2];
		if (match = FEATURE_REGEX.exec(line)) return create_feature(match[1]);
        if (match = SCENARIO_REGEX.exec(line)) return add_scenario(match[1]);
        if (match = STEP_REGEX.exec(line)) return add_step(match[1]);
    };

    var create_feature = function(title, annoations) {
        if (feature) throw new Error("You can only specify a single feature");
        feature = { title: title, annotations: annotations, scenarios: [] };
        annotations = {};
    };

    var add_scenario = function(title) {
        var scenario = {title: title, annotations: annotations, steps: []};
        annotations = {};
        if (!feature) create_feature();
        feature.scenarios.push(scenario);
    };

    var add_step = function(step) {
        if (!feature || feature.scenarios.length == 0) throw new Error("Missing scenario");
        feature.scenarios.slice(-1)[0].steps.push(step);
    };
};

module.exports = FeatureParser;

},{"../Array":1}],19:[function(require,module,exports){
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


var $ = require('../Array');

var StepParser = function() {

    var NON_BLANK_REGEX = /[^\s]/;

    this.parse = function(text, next) {
        var steps = split(text).find_all(non_blanks);
        return next && next(steps) || steps;
    };

    var split = function(text) {
        return $(text.split(/\n/));
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };
};

module.exports = StepParser;
},{"../Array":1}],20:[function(require,module,exports){
module.exports = {
    StepParser: require('./StepParser'),
    FeatureParser: require('./FeatureParser')
}
},{"./FeatureParser":18,"./StepParser":19}],21:[function(require,module,exports){
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
        if (script == undefined) return this;
        yadda.yadda(script, ctx);
    }    
};
},{"yadda":"W+dgdo"}],22:[function(require,module,exports){
var fs = require('fs');
var Yadda = require('../Yadda');
var FeatureParser = require('../parsers/FeatureParser');

module.exports = function(options) {

    var options = options || {};
    var parser = options.parser || new FeatureParser();
    var mode = options.mode || 'async';

    function feature(filename, next) {
        var text = fs.readFileSync(filename, 'utf8');
        parser.parse(text, function(feature) {
            var _describe = feature.annotations.Pending ? xdescribe : describe;
            _describe(feature.title || filename, function() {
                next(feature)
            });
        });
    };

    function async_scenarios(scenarios, next) {
        scenarios.forEach(function(scenario) {
            var _it = scenario.annotations.Pending ? xit : it;
            _it(scenario.title, function(done) {
                next(scenario, done)
            });
        });
    };

    function sync_scenarios(scenarios, next) {
        scenarios.forEach(function(scenario) {
            var _it = scenario.annotations.Pending ? xit : it;
            _it(scenario.title, function() {
                next(scenario)
            });
        });
    };

    GLOBAL.feature = feature;
    GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
};
},{"../Yadda":11,"../parsers/FeatureParser":18,"fs":24}],23:[function(require,module,exports){
module.exports = {
    casper: require('./CasperPlugin'),
    mocha: require('./MochaPlugin'),
    jasmine: require('./MochaPlugin')
}
},{"./CasperPlugin":21,"./MochaPlugin":22}],24:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}]},{},["W+dgdo"])
(W+dgdo)
});
;