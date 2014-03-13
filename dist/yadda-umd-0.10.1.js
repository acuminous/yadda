!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.yaddaumd=e():"undefined"!=typeof global?global.yaddaumd=e():"undefined"!=typeof self&&(self.yaddaumd=e())}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"./fn":15}],2:[function(require,module,exports){
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

    this.validate = function() {
        if (is_undefined()) return { step: step, valid: false, reason: 'Undefined Step' };
        if (is_ambiguous()) return { step: step, valid: false, reason: 'Ambiguous Step (Patterns [' + winning_patterns() + '] are all equally good candidates)' };
        return { step: step, valid: true };
    };

    this.clear_winner = function() {
        if (is_undefined()) throw new Error('Undefined Step: [' + step + ']');
        if (is_ambiguous()) throw new Error('Ambiguous Step: [' + step + ']. Patterns [' + winning_patterns() + '] match equally well.');
        return this.winner();
    };   

    function is_undefined() {
        return results.length == 0;
    };

    function is_ambiguous() {
        return (results.length > 1) && results[0].score.equals(results[1].score); 
    };

    this.winner = function() {
        return results[0].macro;
    };

    function winning_patterns() {
        return results.find_all(by_winning_score).collect(macro_signatures).join(', ');
    };

    function rank(step, macros) {
        results = macros.collect(function(macro) {
            return { 
                macro: macro, 
                score: new LevenshteinDistanceScore(step, macro.levenshtein_signature())
            }
        }).sort( by_ascending_score );
    };

    function by_ascending_score(a, b) { 
        return b.score.beats(a.score);
    };

    function by_winning_score(result) {
        return result.score.equals(results[0].score);
    };

    function macro_signatures(result) {
        return result.macro.toString();
    };

    rank(step, $(macros));
};

module.exports = Competition;
},{"./Array":1,"./LevenshteinDistanceScore":9}],3:[function(require,module,exports){
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

// Understands term definitions
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
},{"./Array":1,"./RegularExpression":13}],5:[function(require,module,exports){
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
},{"./Array":1,"./fn":15}],6:[function(require,module,exports){
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

var FileSearch = require('./FileSearch');

var FeatureFileSearch = function(directories) {
    this.constructor(directories, /.*\.(?:feature|spec|specification)$/);
};
FeatureFileSearch.prototype = new FileSearch();

module.exports = FeatureFileSearch;
},{"./FileSearch":7}],7:[function(require,module,exports){
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

var shims = require('./shims/index');
var path = shims.path;
var process = shims.process;
var fs = shims.fs;
var $ = require('./Array');

// Searches for files in the given directories and their sub-directories, matching at least one of the given patterns
var FileSearch = function(directories, patterns) {

    var patterns = patterns || /.*/;

    this.each = function(fn) {
        this.list().forEach(fn);
    };

    this.list = function() {
        return $(directories).inject($(), function(files, directory) {
            return files.concat(list_files(directory).find_all(by_pattern));
        });
    };

    var list_files = function(directory) {
        return $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));
    };

    var list_immediate_files = function(directory) {
        return ls(directory).find_all(by_file);
    };

    var list_sub_directory_files = function(directory) {
        return ls(directory).find_all(by_directory).inject($(), function(files, directory) {
            return files.concat(list_files(directory));
        });
    };

    var ls = function(directory) {
        if (!fs.existsSync(directory)) return $();
        return $(fs.readdirSync(directory)).collect(function(file) {
            return path.join(directory, file);
        });
    };

    var by_file = function(file) {
        return !by_directory(file);
    };

    var by_directory = function(file) {
        return fs.statSync(file).isDirectory();
    }

    var by_pattern = function(filename) {
        return $(patterns).find(function(pattern) {
            return new RegExp(pattern).test(filename)
        })
    };
};

module.exports = FileSearch;
},{"./Array":1,"./shims/index":37}],8:[function(require,module,exports){
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

    this.validate = function(scenario) {
        var results = $(scenario).collect(function(step) {
            return _this.rank_macros(step).validate();
        });
        if (results.find(by_invalid_step)) throw new Error('Scenario cannot be interpreted\n' + results.collect(validation_report).join('\n'));
    };

    function by_invalid_step(result) {
        return !result.valid;  
    };

    function validation_report(result) {
        return result.step + (result.valid ? '' : ' <-- ' + result.reason);
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
        this.rank_macros(step).clear_winner().interpret(step, context || {}, next);
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
},{"./Array":1,"./Competition":2,"./Context":3,"./EventBus":5,"./fn":15}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
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
},{"./Array":1,"./Dictionary":4,"./Macro":11}],11:[function(require,module,exports){
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

// Understands how to invoke a step
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

},{"./Context":3,"./EventBus":5,"./RegularExpression":13,"./fn":15}],12:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};module.exports = Platform;

function Platform() {

    function get_container() {
        if (is_browser()) return window;
        if (is_phantom()) return phantom;
        if (is_node()) return global;         
    }

    function is_node() {
        return typeof module != 'undefined' &&
               typeof module.exports != 'undefined';
    }

    function is_browser() {
        return typeof window != 'undefined';
    }

    function is_phantom() {
        return typeof phantom != 'undefined';
    }

    return {
        get_container: get_container,
        is_node: is_node,
        is_browser: is_browser,
        is_phantom: is_phantom
    }

}

},{}],13:[function(require,module,exports){
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
},{"./Array":1}],14:[function(require,module,exports){
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
        this.interpreter.validate(scenario);
        this.interpreter.interpret(scenario, new Context().merge(interpreter_context).merge(scenario_context), next);
    };

    this.toString = function() {
        return "Yadda 0.10.0 Copyright 2010 Acuminous Ltd / Energized Work Ltd";
    };
};

module.exports = Yadda;

},{"./Context":3,"./Interpreter":8,"./fn":15}],15:[function(require,module,exports){
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
module.exports=require('3V0FPO');
},{}],"3V0FPO":[function(require,module,exports){
module.exports = {
    Yadda: require('./Yadda'),
    EventBus: require('./EventBus'),
    Interpreter: require('./Interpreter'),
    Context: require('./Context'),
    Library: require('./Library'),
    Dictionary: require('./Dictionary'),
    FeatureFileSearch: require('./FeatureFileSearch'),    
    FileSearch: require('./FileSearch'),
    Platform: require('./Platform'),    
    localisation: require('./localisation/index'),
    parsers: require('./parsers/index'),
    plugins: require('./plugins/index'),
    shims: require('./shims/index')
};

},{"./Context":3,"./Dictionary":4,"./EventBus":5,"./FeatureFileSearch":6,"./FileSearch":7,"./Interpreter":8,"./Library":10,"./Platform":12,"./Yadda":14,"./localisation/index":24,"./parsers/index":28,"./plugins/index":31,"./shims/index":37}],18:[function(require,module,exports){
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

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '[Ff]eature',
        scenario: '(?:[Ss]cenario|[Ss]cenario [Oo]utline)',
        examples: '(?:[Ee]xamples|[Ww]here)',
        pending: 'Pending',
        background: '[Bb]ackground',
        given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
        when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)',
        then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)',
        _steps: ['given', 'when', 'then']
    };

    return new Language('English', vocabulary);
})();

},{"./Language":20}],19:[function(require,module,exports){
/* -*- coding: utf-8 -*-
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

var Language = require('./Language');

module.exports = (function() {
    
    var vocabulary = {
        feature: '(?:[Ff]onctionnalité)',
        scenario: '(?:[Ss]cénario|[Pp]lan [Dd]u [Ss]cénario)',
        examples: '(?:[Ee]xemples|[Ee]xemple|[Oo][uù])',
        pending: 'En attente',
        background: '[Ff]ond',
        given: '(?:[Ss]oit|[ÉéEe]tant données|[ÉéEe]tant donnée|[ÉéEe]tant donnés|[ÉéEe]tant donné|[Aa]vec|[Ee]t|[Mm]ais|[Aa]ttendre)',
        when: '(?:[Qq]uand|[Ll]orsqu\'|[Ll]orsque|[Ss]i|[Ee]t|[Mm]ais)',
        then: '(?:[Aa]lors|[Aa]ttendre|[Ee]t|[Mm]ais)',
        
        _steps: [
            'given', 'when', 'then', 
            'soit', 'etantdonnees', 'etantdonnee', 'etantdonne',
            'quand', 'lorsque',
            'alors'
        ],
        // Also aliasing French verbs for given-when-then for signature-lookup
        get soit() { return this.given },
        get etantdonnees() { return this.given },
        get etantdonnee() { return this.given },
        get etantdonne() { return this.given },
        get quand() { return this.when },
        get lorsque() { return this.when },
        get alors() { return this.then }
    };
    
    return new Language('French', vocabulary);
})();



},{"./Language":20}],20:[function(require,module,exports){
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

module.exports = function(name, vocabulary) {

    var _this = this;

    this.library = function(dictionary) {
        return _this.localise_library(new Library(dictionary));
    };

    this.localise_library = function(library) {
        $(vocabulary._steps).each(function(keyword) {
            library[keyword] = function(signatures, fn, ctx) {
                return $(signatures).each(function(signature) {
                    var signature = prefix_signature(_this.localise(keyword), signature);
                    return library.define(signature, fn, ctx);
                });
            };
        });
        return library;
    };

    var prefix_signature = function(prefix, signature) {
        var regex_delimiters = new RegExp('^/|/$', 'g');
        var start_of_signature = new RegExp(/^(?:\^)?/);
        var one_or_more_spaces = '\\s+';
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix + one_or_more_spaces);
    };

    this.localise = function(keyword) {
        if (vocabulary[keyword] == undefined) throw new Error('Keyword "' + keyword + '" has not been translated into ' + name + '.');
        return vocabulary[keyword];
    };
};
},{"../Array":1,"../Library":10}],21:[function(require,module,exports){
﻿/*
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

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '[Ee]genskap',
        scenario: '[Ss]cenario',
        examples: '[Ee]ksempler',
        pending: 'Avventer',
        background: '[Bb]akgrunn',
        given: '(?:[Gg]itt|[Mm]ed|[Oo]g|[Mm]en|[Uu]nntatt)',
        when: '(?:[Nn]år|[Oo]g|[Mm]en)',
        then: '(?:[Ss]å|[Ff]forvent|[Oo]g|[Mm]en)',
        _steps: ['given', 'when', 'then', 'gitt', 'når', 'så'],
        // Also aliasing Norwegian verbs for given-when-then for signature-lookup
        get gitt() { return this.given },
        get når() { return this.when },
        get så() { return this.then }
    };

    return new Language('Norwegian', vocabulary);
})();

},{"./Language":20}],22:[function(require,module,exports){
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

var Language = require('./Language');

module.exports = (function() {

    var vocabulary = {
        feature: '(?:[Tt]ale|[Yy]arn)',
        scenario: '(?:[Aa]dventure|[Ss]ortie)',
        examples: '[Ww]herest',
        pending: 'Brig',
        background: '[Aa]ftground',
        given: '(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
        when: '(?:[Ww]hence|[Ii]f|[Aa]nd|[Bb]ut)',
        then: '(?:[Tt]hence|[Ee]xpect|[Aa]nd|[Bb]ut)',
        _steps: ['given', 'when', 'then', 'giveth', 'whence', 'thence'],
        // Also aliasing Pirate verbs for given-when-then for signature-lookup
        get giveth() { return this.given },
        get whence() { return this.when },
        get thence() { return this.then }        

    };

    return new Language('Pirate', vocabulary);
})();

},{"./Language":20}],23:[function(require,module,exports){
/* -*- coding: utf-8 -*-
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

var Language = require('./Language');

module.exports = (function() {
    
    var vocabulary = {
        feature: '(?:[Ff]uncionalidad|[Cc]aracterística)',
        scenario: '(?:[Ee]scenario|[Cc]aso)',
        examples: '(?:[Ee]jemplos|[Ee]jemplo)',
        pending: 'Pendiente',
        background: '[Ff]ondo',
        given: '(?:[Ss]ea|[Ss]ean|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas)',
        when: '(?:[Cc]uando|[Ss]i|[Qq]ue)',
        then: '(?:[Ee]ntonces)',
        
        _steps: [
            'given', 'when', 'then', 
            'sea', 'sean', 'dado', 'dada','dados', 'dadas',
            'cuando', 'si',
            'entonces'
        ],

        get sea() { return this.given },
        get sean() { return this.given },
        get dado() { return this.given },
        get dada() { return this.given },
        get dados() { return this.given },
        get dadas() { return this.given },
        get cuando() { return this.when },
        get si() { return this.when },
        get entonces() { return this.then }
    };
    
    return new Language('Spanish', vocabulary);
})();



},{"./Language":20}],24:[function(require,module,exports){
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

module.exports = {
    English: require('./English'),
    Spanish: require('./Spanish'),
    French: require('./French'),
    Norwegian: require('./Norwegian'),
    Pirate: require('./Pirate'),
    Language: require('./Language')
}
},{"./English":18,"./French":19,"./Language":20,"./Norwegian":21,"./Pirate":22,"./Spanish":23}],25:[function(require,module,exports){
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
var FeatureFileParser = function(language) {

    // Requiring fs locally so it doesn't break component
    var fs = require('fs');
    var FeatureParser = require('./FeatureParser');
    var parser = new FeatureParser(language);

    this.parse = function(file, next) {
        var text = fs.readFileSync(file, 'utf8');
        var feature = parser.parse(text);
        return next && next(feature) || feature;
    } 
}

module.exports = FeatureFileParser;
},{"./FeatureParser":26,"fs":42}],26:[function(require,module,exports){
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
var fn = require('../fn');

var English = require('../localisation/English');

var FeatureParser = function(language) {

    var language = language || English;

    var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
    var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
    var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
    var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
    var TEXT_REGEX = new RegExp('^\\s*([^\\s].*)', 'i');
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}')
    var BLANK_REGEX = new RegExp('^\\s*$');
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^@([^=]*)$');
    var NVP_ANNOTATION_REGEX = new RegExp('^@([^=]*)=(.*)$');

    var specification = undefined;
    var comment = undefined;
    var line = undefined;
    var line_number = 0;

    this.parse = function(text, next) {
        reset();
        split(text).each(parse_line);
        return next && next(specification.export()) || specification.export();
    };

    function reset() {
        specification = new Specification();
        comment = false;
        line_number = 0;
    };

    function split(text) {
        return $(text.split(/\r\n|\n/));
    };

    function parse_line(line, index) {
        var match;
        try {
            if (match = MULTI_LINE_COMMENT_REGEX.test(line)) return comment = !comment;
            if (match = SINGLE_LINE_COMMENT_REGEX.test(line)) return;        
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: true });
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: match[2] });
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1]);
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1]);
            if (match = BACKGROUND_REGEX.exec(line)) return specification.handle('Background', match[1]);
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples');
            if (match = BLANK_REGEX.test(line)) return specification.handle('Blank');
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1]);
        } catch (e) {
            throw new Error('Error parsing line ' + (index  + 1) + ', "' + line + '".\n' + e.message);
        };
    };
}

var Handlers = function(handlers) {

    var handlers = handlers || {};

    this.register = function(event, handler) {
        handlers[event] = handler;
    };

    this.unregister = function(event) {
        delete handlers[event];
    };

    this.find = function(event) {
        if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');
        return { handle: handlers[event.toLowerCase()] };
    };
};

var Specification = function() {

    var current_element = this;
    var feature = undefined;
    var annotations = {};
    var handlers = new Handlers({
        text: fn.noop,
        blank: fn.noop,        
        annotation: stash_annotation,
        feature: start_feature,
        scenario: start_scenario,
        background: start_background,
    });

    function stash_annotation(event, annotation) {
        handlers.unregister('background');
        annotations[annotation.key] = annotation.value;
        annotations[annotation.key.toLowerCase().replace(/\W/g, '_')] = annotation.value;
    };

    function start_feature(event, title) {
        return feature = new Feature(title, annotations, {});
    };

    function start_scenario(event, title) {
        feature = new Feature(title, {}, annotations);
        return feature.on(event, title);
    }; 

    var start_background = start_scenario;  

    this.handle = function(event, data) {
        current_element = current_element.on(event, data);
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;        
    };

    this.export = function() {
        if (!feature) throw new Error('A feature must contain one or more scenarios');
        return feature.export();
    };
};

var Feature = function(title, annotations, stashed_annotations) {

    var description = [];
    var scenarios = [];
    var background = new NullBackground();
    var handlers = new Handlers({
        text: capture_description,
        blank: end_description,        
        annotation: stash_annotation,        
        scenario: start_scenario,
        background: start_background
    }); 
    var _this = this;

    function start_background(event, title) {
        background = new Background(title, _this);
        stashed_annotations = {};
        return background;
    };

    function stash_annotation(event, annotation) {
        handlers.unregister('background');        
        stashed_annotations[annotation.key] = annotation.value;
        stashed_annotations[annotation.key.toLowerCase().replace(/\W/g, '_')] = annotation.value;
    };

    function capture_description(event, text) {
        description.push(text);
    };

    function end_description() {
        handlers.unregister('text');
        handlers.register('blank', fn.noop);
    };

    function start_scenario(event, title) {
        var scenario = new Scenario(title, background, stashed_annotations, _this);
        scenarios.push(scenario);
        stashed_annotations = {};        
        return scenario;
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        return {
            title: title,
            annotations: annotations,
            description: description,
            scenarios: $(scenarios).collect(function(scenario) {
                return scenario.export();
            }).flatten().naked()
        };        
    };
};

var Background = function(title, feature) {

    var steps = [];
    var handlers = new Handlers({
        text: fn.noop,        
        blank: end_description,
        scenario: start_scenario
    }); 
    var _this = this;  

    function end_description() {
        handlers.register('text', capture_step);
        handlers.register('blank', fn.noop);
    };

    function capture_step(event, text) {
        steps.push(text);
    }

    function start_scenario(event, data) {
        validate();
        return feature.on(event, data);
    };  

    function validate() {
        if (steps.length == 0) throw new Error('Background requires one or more steps');        
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        validate();
        return {
            steps: steps
        };
    };
};

var NullBackground = function() {
    var handlers = new Handlers(); 

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        return {
            steps: []
        };
    };    
}

var Scenario = function(title, background, annotations, feature) {

    var description = [];
    var steps = [];
    var examples = undefined;
    var handlers = new Handlers({
        text: capture_description,        
        blank: end_description,
        annotation: start_scenario,
        scenario: start_scenario,
        examples: start_examples
    }); 
    var _this = this;  

    function capture_description(event, text) {
        description.push(text);
    };

    function end_description() {
        handlers.register('text', capture_step);
        handlers.register('blank', fn.noop);
    };

    function capture_step(event, text) {
        steps.push(text);
    }

    function start_scenario(event, data) {
        validate();
        return feature.on(event, data);
    };  

    function start_examples(event, data) {
        validate();
        return examples = new Examples(_this);
    };

    function validate() {
        if (steps.length == 0) throw new Error('Scenario requires one or more steps');        
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.export = function() {
        validate();
        var result = {
            title: title,
            annotations: annotations,
            description: description,
            steps: background.export().steps.concat(steps)
        };
        return examples ? examples.expand(result) : result;
    };
};

var Examples = function(scenario) {

    var SURROUNDING_WHITESPACE_REGEX = /^\s+|\s+$/g;

    var headings = [];
    var examples = $();
    var handlers = new Handlers({
        text: capture_headings,        
        blank: fn.noop,
        annotation: start_scenario,
        scenario: start_scenario,
    });
    var _this = this;

    function capture_headings(event, data) {
        handlers.register('text', capture_example);
        headings = split(data).collect(function(column) {
            return column.replace(SURROUNDING_WHITESPACE_REGEX, '');
        }).naked();
    };

    function capture_example(event, data) {
        var fields = split(data, headings.length);
        var example = {};
        fields.each(function(field, index) {
            example[headings[index]] = field.replace(SURROUNDING_WHITESPACE_REGEX, '');            
        });
        examples.push(example);
    };

    function split(row, number_of_fields) {
        var fields = $(row.split('|'));
        if (number_of_fields != undefined && number_of_fields != fields.length) {
            throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);                    
        }
        return fields;
    };

    function start_scenario(event, data) {
        validate();
        return scenario.on(event, data);
    };

    function validate() {
        if (headings.length == 0) throw new Error('Examples table requires one or more headings');
        if (examples.length == 0) throw new Error('Examples table requires one or more rows');        
    };

    this.on = function(event, data) {
        return handlers.find(event).handle(event, data) || this;
    };

    this.expand = function(scenario) {
        validate();
        return examples.collect(function(example) {
            return {
                title: substitute(example, scenario.title),
                annotations: scenario.annotations,
                description: substitute_all(example, scenario.description),
                steps: substitute_all(example, scenario.steps)
            };
        }).naked();
    };

    function substitute_all(example, lines) {
        return $(lines).collect(function(line) {
            return substitute(example, line);
        }).naked();
    };

    function substitute(example, line) {
        for (var heading in example) {
            line = line.replace(new RegExp('\\[\\s*' + heading + '\\s*\\]', 'g'), example[heading]);
        };
        return line;        
    };
};

module.exports = FeatureParser;
},{"../Array":1,"../fn":15,"../localisation/English":18}],27:[function(require,module,exports){
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
},{"../Array":1}],28:[function(require,module,exports){
module.exports = {
    StepParser: require('./StepParser'),
    FeatureParser: require('./FeatureParser'),
    FeatureFileParser: require('./FeatureFileParser')
}
},{"./FeatureFileParser":25,"./FeatureParser":26,"./StepParser":27}],29:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};if (!module.client) {   
    var fs = require('fs');
    global.process = global.process || {
        cwd: function() {
            return fs.workingDirectory
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
        if (script == undefined) return this;
        yadda.yadda(script, ctx);
    }
};

},{"fs":42,"yadda":"3V0FPO"}],30:[function(require,module,exports){
if (!module.client) {
	var fs = require('fs');
}
var English = require('../localisation/English');
var FeatureParser = require('../parsers/FeatureParser');
var $ = require('../Array');

module.exports = function(options) {

    var options = options || {};
    var language = options.language || English;
    var parser = options.parser || new FeatureParser(language);
    var mode = options.mode || 'async';

    if (options.deprecation_warning != false) {
        console.log('The MochaPlugin is deprecated as os 0.10.0 and will be removed in 0.12.0');
        console.log('Replace it with one of AsyncScenarioLevelPlugin, SyncScenarioLevelPlugin, AsyncStepLevelPlugin or SyncStepLevelPlugin');
        console.log('To disable this message use Yadda.plugins.mocha({deprecation_warning: false})');
        console.log('See the readme for more details')        
    }

	if (module.client) {
		var feature = function (text, next) {
			parser.parse(text, function(feature) {
				var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
				_describe(feature.title || filename, function() {
					next(feature)
				});
			});
		};
	} else {
		var feature = function (filenames, next) {
			$(filenames).each(function(filename) {
				var text = fs.readFileSync(filename, 'utf8');
				parser.parse(text, function(feature) {
					var _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;
					_describe(feature.title || filename, function() {
						next(feature)
					});
				});
			});
		};
	}

    function async_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function(done) {
                next(scenario, done)
            });
        });
    };

    function sync_scenarios(scenarios, next) {
        $(scenarios).each(function(scenario) {
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;
            _it(scenario.title, function() {
                next(scenario)
            });
        });
    };

	if (typeof GLOBAL !== 'undefined') {
		GLOBAL.features = GLOBAL.feature = feature;
		GLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
	}

	if (typeof window !== 'undefined') {
		window.features = window.feature = feature;
		window.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;
	}
};

},{"../Array":1,"../localisation/English":18,"../parsers/FeatureParser":26,"fs":42}],31:[function(require,module,exports){
module.exports = {
    casper: require('./CasperPlugin'),
    get mocha() { 
        var legacyPlugin = require('./MochaPlugin');
        legacyPlugin.AsyncScenarioLevelPlugin = require('./mocha/AsyncScenarioLevelPlugin');
        legacyPlugin.SyncScenarioLevelPlugin = require('./mocha/SyncScenarioLevelPlugin');
        legacyPlugin.AsyncStepLevelPlugin = require('./mocha/AsyncStepLevelPlugin');
        legacyPlugin.SyncStepLevelPlugin = require('./mocha/SyncStepLevelPlugin');
        return legacyPlugin;
    },
    get jasmine() { 
        return this.mocha
    }
}
},{"./CasperPlugin":29,"./MochaPlugin":30,"./mocha/AsyncScenarioLevelPlugin":32,"./mocha/AsyncStepLevelPlugin":33,"./mocha/SyncScenarioLevelPlugin":35,"./mocha/SyncStepLevelPlugin":36}],32:[function(require,module,exports){
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

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    var platform = new Platform();
    var options = options || {};    
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {        
        $(scenarios).each(function(scenario) {
            base_plugin.it_async(scenario.title, scenario, iterator);
        });
    }    

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;          
};
},{"../../Array":1,"../../Platform":12,"./BasePlugin":34}],33:[function(require,module,exports){
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

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    var platform = new Platform();
    var options = options || {};
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.describe(scenario.title, scenario, iterator);                        
        });        
    } 

    function steps(steps, iterator) {
        $(steps).each(function(step) {
            base_plugin.it_async(step, step, iterator);
        });        
    }     

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.feature;
    container.scenarios = container.scenario = scenarios;
    container.steps = steps;
};
},{"../../Array":1,"../../Platform":12,"./BasePlugin":34}],34:[function(require,module,exports){
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


var English = require('../../localisation/English');
var Platform = require('../../Platform');
var FeatureFileParser = require('../../parsers/FeatureFileParser');
var $ = require('../../Array');

module.exports.create = function(options) {

    var platform = new Platform();
    var language = options.language || English;
    var container = options.container || platform.get_container();
        
    function featureFiles(files, iterator) {
        var parser = new FeatureFileParser(language);
        $(files).each(function(file) {
            features(parser.parse(file), iterator)
        });
    };

    function features(features, iterator) {
        $(features).each(function(feature) {
            describe(feature.title, feature, iterator);
        });        
    };

    function describe(title, subject, iterator) {
        var _describe = is_pending(subject) ? container.xdescribe : container.describe;
        _describe(title, function() {
            iterator(subject)
        });        
    }    

    function it_async(title, subject, iterator) {
        var _it = is_pending(subject) ? container.xit : container.it;
        _it(title, function(done) {
            iterator(subject, done);
        }) 
    }

    function it_sync(title, subject, iterator) {
        var _it = is_pending(subject) ? container.xit : container.it;
        _it(title, function() {
            iterator(subject);
        }) 
    }  

    function is_pending(subject) {
        return subject.annotations && subject.annotations[language.localise('pending')];
    }

    return {
        featureFiles: featureFiles,
        features: features,
        describe: describe,
        it_async: it_async,
        it_sync: it_sync
    }        
};
},{"../../Array":1,"../../Platform":12,"../../localisation/English":18,"../../parsers/FeatureFileParser":25}],35:[function(require,module,exports){
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

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    var platform = new Platform();
    var options = options || {};    
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.it_sync(scenario.title, scenario, iterator);
        });
    }

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;     
};
},{"../../Array":1,"../../Platform":12,"./BasePlugin":34}],36:[function(require,module,exports){
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

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function(options) {

    var platform = new Platform();
    var options = options || {};    
    var container = options.container || platform.get_container();

    var base_plugin = BasePlugin.create(options);

    function scenarios(scenarios, iterator) {
        $(scenarios).each(function(scenario) {
            base_plugin.describe(scenario.title, scenario, iterator);                        
        });        
    } 

    function steps(steps, iterator) {
        $(steps).each(function(step) {
            base_plugin.it_sync(step, step, iterator);
        });        
    }  

    container.featureFiles = container.featureFile = base_plugin.featureFiles;
    container.features = container.feature = base_plugin.features;
    container.scenarios = container.scenario = scenarios;
    container.steps = steps;
};
},{"../../Array":1,"../../Platform":12,"./BasePlugin":34}],37:[function(require,module,exports){
var process=require("__browserify_process");/*
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

var Platform = require('../Platform');

module.exports = (function() {

    var platform = new Platform();

    var shims = {
        node: function() {
            return {
                fs: require('fs'),
                path: require('path'),
                process: process
            }
        },
        phantom: function() {
            return {
                fs: require('./phantom-fs'),
                path: require('./phantom-path'),
                process: require('./phantom-process')
            }
        }
    }

    function get_shim() {
        if (platform.is_phantom()) return shims.phantom();
        if (platform.is_node()) return shims.node();
        
        throw new Error('Unsupported Platform');
    }

    return get_shim();
})();

},{"../Platform":12,"./phantom-fs":38,"./phantom-path":39,"./phantom-process":40,"__browserify_process":45,"fs":42,"path":43}],38:[function(require,module,exports){
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
    if (module.client) {
        // Running in browser, not via node
        return {}; // short-circuit;
    }

    var fs = require('fs');

    fs.existsSync = fs.existsSync || fs.exists;

    fs.readdirSync = fs.readdirSync || function(path) {
        return fs.list(path).filter(function(name) {
            return name != '.' && name != '..';
        });
    };

    fs.statSync = fs.statSync || function(path) {
        return {
            isDirectory: function() {
                return fs.isDirectory(path);
            }
        }
    };

    return fs;
})();

},{"fs":42}],39:[function(require,module,exports){
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
    if (module.client) {
        // Running in browser, not via node
        return {}; // short-circuit;
    }

    var fs = require('fs');
    var path = {};

    try {
        path = require('path');
    } catch (e) {
        // meh
    };

    path.join = path.join || function() {
        return Array.prototype.join.call(arguments, fs.separator);
    };

    path.relative = path.relative || function(from, to) {
        return from + fs.separator + to;
    };

    return path;

})();

},{"fs":42,"path":43}],40:[function(require,module,exports){
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
    if (module.client) {
        // Running in browser, not via node
        return {}; // short-circuit;
    }

    var fs = require('fs');
    var process = typeof process != 'undefined' ? process : {};

    process.cwd = function() {
        return fs.workingDirectory;
    };

    return process;

})();

},{"fs":42}],41:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],42:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],43:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var shims = require('_shims');

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(shims.filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = shims.substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(shims.filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(shims.filter(paths, function(p, index) {
    if (!util.isString(p)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

},{"__browserify_process":45,"_shims":41,"util":44}],44:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":41}],45:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},["3V0FPO"])
(3V0FPO)
});
;