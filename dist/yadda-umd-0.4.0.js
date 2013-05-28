(function(e){if("function"==typeof bootstrap)bootstrap("yadda_umd",e);else if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else if("undefined"!=typeof ses){if(!ses.ok())return;ses.makeYaddaumd=e}else"undefined"!=typeof window?window.yaddaumd=e():global.yaddaumd=e()})(function(){var define,ses,bootstrap,module,exports;
return (function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({"yadda":[function(require,module,exports){
module.exports=require('gUiUAT');
},{}],"gUiUAT":[function(require,module,exports){
module.exports = {    
    Yadda: require('./Yadda'),    
    Interpreter: require('./Interpreter'),    
    Library: require('./Library'),    
    Dictionary: require('./Dictionary'),
    localisation: require('./localisation/index'),
    parsers: require('./parsers/index'),
    plugins: require('./plugins/index')
};

},{"./Yadda":1,"./Interpreter":2,"./Library":3,"./Dictionary":4,"./localisation/index":5,"./parsers/index":6,"./plugins/index":7}],1:[function(require,module,exports){
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
var fn = require('./fn');

// Provides a repetitive interface, i.e. new Yadda().yadda().yadda() interface to the Yadda Interpreter
var Yadda = function(libraries, ctx) {

    this.interpreter = new Interpreter(libraries);
    var environment = new Environment(ctx);
    var _this = this;    

    this.requires = function(libraries) {
        this.interpreter.requires(libraries);
        return this;
    };

    this.yadda = function(script, ctx, next) {
        if (script == undefined) return this;
        if (arguments.length == 2 && fn.is_function(ctx)) {
            next = ctx;            
            ctx = undefined;
        };
        run(script, environment.merge(ctx), next);          
    };

    var run = function(script, env, next) {
        _this.interpreter.interpret(script, env.ctx, next);
    };

    this.toString = function() {
        "Yadda 0.4.0 Copyright 2010 Acuminous Ltd / Energized Work Ltd";
    };   
};

module.exports = Yadda;

},{"./Interpreter":2,"./Environment":8,"./fn":9}],2:[function(require,module,exports){
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
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function(libraries) {

    var libraries = $(libraries);
    var _this = this;

    this.requires = function(libraries) {
        libraries.push_all(libraries);
        return this;
    };

    this.interpret = function(scenario, ctx, next) {
        var iterator = function(step, index, callback) {
            _this.interpret_step(step, ctx, callback);
        };
        if (!next) iterator = fn.asynchronize(null, iterator);
        $(scenario).eachAsync(iterator, next);
    };

    this.interpret_step = function(step, ctx, callback) {
        this.rank_macros(step).clear_winner().interpret(step, ctx, callback);
    };  

    this.rank_macros = function(step) {
        return new Competition(step, compatible_macros(step));
    };

    var compatible_macros = function(step) {
        return libraries.inject([], function(macros, library) {
            return macros.concat(library.find_compatible_macros(step));
        });
    };
}

module.exports = Interpreter;
},{"./Competition":10,"./Array":11,"./fn":9}],3:[function(require,module,exports){
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

    this.define = function(signatures, fn, ctx) {
        $(signatures).each(function(signature) {            
            define_macro(signature, fn, ctx);
        });
        return this;        
    };

    var define_macro = function(signature, fn, ctx) {
        if (_this.get_macro(signature)) throw 'Duplicate macro: [' + signature + ']';
        macros.push(new Macro(signature, dictionary.expand(signature), fn, ctx));
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
},{"./Macro":12,"./Array":11,"./Dictionary":4}],4:[function(require,module,exports){
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
        if (this.is_defined(term)) throw 'Duplicate definition: [' + term + ']';
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

    var expand_sub_terms = function(term, already_expanding) {
        return get_sub_terms(term).each(function(sub_term) {
            if (already_expanding.in_array(sub_term)) throw 'Circular Definition: \[' + already_expanding.join(', ') + '\]'; 
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
},{"./Array":11,"./RegularExpression":13}],5:[function(require,module,exports){
module.exports = {
    English: require('./English'),
    Pirate: require('./Pirate')

}
},{"./English":14,"./Pirate":15}],6:[function(require,module,exports){
module.exports = {
    TextParser: require('./TextParser')
}
},{"./TextParser":16}],7:[function(require,module,exports){
module.exports = {
    CasperPlugin: require('./CasperPlugin')
}
},{"./CasperPlugin":17}],8:[function(require,module,exports){
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

// Understands a macros execution context
var Environment = function(ctx) {

    this.ctx = {};
    this._merge_on = 'ctx';

    this.merge = function(other) {
        other = get_item_to_merge(other);
        return new Environment(this.ctx)._merge(other);
    };

    var get_item_to_merge = function(other) {
        if (!other) return {};
        return other._merge_on ? other[other._merge_on] : other;
    };

    this._merge = function(other_ctx) {
        for (var key in other_ctx) { this.ctx[key] = other_ctx[key] }; 
        return this;
    };

    this._merge(ctx);
};

module.exports = Environment;
},{}],9:[function(require,module,exports){
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
            next();
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

},{}],17:[function(require,module,exports){
var CasperPlugin = function(yadda, casper) {

    this.init = function() {

        yadda.interpreter.interpret_step = function(step, ctx) {
            var _this = this;
            casper.then(function() {
                casper.test.info(step);
                _this.rank_macros(step).clear_winner().interpret(step, ctx);            
            });  
        };

        casper.yadda = function(script, ctx) {
            if (script == undefined) return this;
            yadda.yadda(script, ctx);
        }

        return casper;
    };
};

module.exports = CasperPlugin;

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

var LevenshteinDistanceScore = require('./LevenshteinDistanceScore');
var $ = require('./Array');

// Understands appropriateness of macros in relation to a specific step
var Competition = function(step, macros) {

    var results = [];
    var by_ascending_score = function(a, b) { return b.score.beats(a.score); };
    var FIRST_PLACE = 0;
    var SECOND_PLACE = 1;

    this.clear_winner = function() {
        if (number_of_competitors() == 0) throw 'Undefined Step: [' + step + ']';
        if (joint_first_place()) throw 'Ambiguous Step: [' + step + ']';
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
},{"./LevenshteinDistanceScore":18,"./Array":11}],11:[function(require,module,exports){
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
        array.eachAsync = fn.curry(array, eachAsync, array);
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

    function eachAsync(items, iterator, callback) { 
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
        var results = [];
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
},{"./fn":9}],12:[function(require,module,exports){
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
    var macro = macro || fn.noop;
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

},{"./fn":9,"./Environment":8,"./RegularExpression":13}],13:[function(require,module,exports){
(function(){/*
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
})()
},{"./Array":11}],14:[function(require,module,exports){
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
            var signature = prefix_signature('(?:[Ww]hen|[Aa]nd|[Bb]ut) ', signature);
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
},{"../Library":3,"../Array":11}],16:[function(require,module,exports){
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

var TextParser = function() {

    var SCENARIO_REGEX = /^\s*Scenario:\s*(.*)$/i;
    var STEP_REGEX = /^\s*([^\s].*)$/;
    var NON_BLANK_REGEX = /[^\s]/;

    var current_scenario;
    var scenarios = [];

    this.parse = function(text) {
        current_scenario = {};
        split(text).each(function(line) {
            parse_line(line);
        });
        return scenarios;
    };

    var split = function(text) {
        return $(text.split(/\n/)).find_all(non_blanks);
    };

    var non_blanks = function(text) {
        return text && NON_BLANK_REGEX.test(text);
    };

    var parse_line = function(line) {
        var match;
        if (match = SCENARIO_REGEX.exec(line)) {
            current_scenario = { title: match[1], steps: [] };            
            scenarios.push(current_scenario);
        } else if (match = STEP_REGEX.exec(line)) {
            current_scenario.steps.push(match[1]);
        }
    }
};

module.exports = TextParser;
},{"../Array":11}],15:[function(require,module,exports){
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
},{"../Library":3,"../Array":11,"../localisation":5}],18:[function(require,module,exports){
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
},{}]},{},["gUiUAT"])(gUiUAT)
});
;