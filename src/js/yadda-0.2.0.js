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

// Provides a recursive interface, i.e. new Yadda().yadda().yadda() interface to the Yadda Interpreter
Yadda = function(libraries, ctx) {

    this.libraries = libraries;
    this.ctx = ctx;

    this.yadda = function(script) {
        if (script == undefined) return this;
        new Yadda.Interpreter(this.libraries).interpret(script, this.ctx);
    }
}

// Understands a scenario
Yadda.Interpreter = function(libraries) {

    this.libraries = Yadda.Util.ensure_array(libraries);
    _this = this;

    this.requires = function(libraries) {
        this.libraries.push_all(libraries);
        return this;
    };

    this.interpret = function(scenario, ctx) {
        Yadda.Util.ensure_array(scenario).each(function(step) { 
            _this.interpret_step(step, ctx);
        });
    };   

    this.interpret_step = function(step, ctx) {
        this.competing_macros(step).clear_winner().interpret(step, ctx);
    };

    this.competing_macros = function(step) {
        return new Yadda.Competition(step, this.compatible_macros(step));
    };

    this.compatible_macros = function(step) {
        var compatible_macros = [];
        this.libraries.each(function(library) {
            compatible_macros = compatible_macros.concat(library.find_compatible_macros(step));
        })
        return compatible_macros;        
    };
}

// Understands how to index macros
Yadda.Library = function(dictionary) {

    this.dictionary = dictionary ? dictionary : new Yadda.Dictionary();
    this.macros = Yadda.Util.ensure_array([]);

    this.define = function(signature, fn, ctx) {
        if (this.get_macro(signature)) throw 'Duplicate macro: [' + signature + ']';
        this.macros.push(new Yadda.Macro(signature, this.dictionary.expand(signature), fn, ctx));
        return this;
    };

    this.get_macro = function(signature) {
        return this.macros.find(function(other_macro) {
            return other_macro.is_identified_by(signature);
        });
    };

    this.find_compatible_macros = function(step) {
        return this.macros.find_all(function(macro) {
            return macro.can_interpret(step);
        });
    }; 
};

// Understands a step
Yadda.Macro = function(signature, signature_pattern, fn, ctx) {    
    
    this.init = function(signature, signature_pattern, fn, ctx) {
        this.signature = this.normalise(signature);
        this.signature_pattern = new Yadda.RegularExpression(signature_pattern);
        this.fn = fn;
        this.environment = new Yadda.Environment(ctx);
    }

    this.is_identified_by = function(other_signature) {
        return this.signature == this.normalise(other_signature);        
    }; 

    this.can_interpret = function(step) {
        return this.signature_pattern.test(step);
    };  

    this.interpret = function(step, ctx) {    
        var args = this.signature_pattern.groups(step);
        var env = this.environment.merge(ctx);
        var fn = Yadda.Util.bind(env.ctx, this.fn);
        return fn(args);
    };

    this.levenshtein_signature = function() {
        return this.signature_pattern.undress();            
    };

    this.normalise = function(signature) {
        return new RegExp(signature).toString();
    }

    this.toString = function() {
        return this.signature;
    };

    this.init(signature, signature_pattern, fn, ctx)
};

// Understands definitions of terms
Yadda.Dictionary = function(prefix) {

    this.prefix = prefix ? prefix : '$';
    this.terms = {};
    this.term_pattern = new Yadda.RegularExpression(new RegExp('(?:^|[^\\\\])\\' + this.prefix + '(\\w+)', 'g'));    
    _this = this;

    this.define = function(term, definition) {
        if (this.exists(term)) throw 'Duplicate definition: [' + term + ']';
        this.terms[term] = this.normalise(definition);
        return this;
    };

    this.exists = function(term) {
        return this.terms[term];
    };

    this.normalise = function(definition) {
        return definition.toString().replace(/^\/|\/$/g, '');
    }

    this.expand = function(term, already_expanding) {
        var already_expanding = Yadda.Util.ensure_array(already_expanding);
        if (!this.is_expandable(term)) return term;
        return this.expand_sub_terms(term, already_expanding);
    };

    this.expand_sub_terms = function(term, already_expanding) {
        return this.term_pattern.groups(term).each(function(sub_term) {
            if (already_expanding.in_array(sub_term)) throw 'Circular Definition: \[' + already_expanding.join(', ') + '\]'; 
            var sub_term_definition = _this.expand_sub_term(sub_term, already_expanding);
            return term = term.replace(_this.prefix + sub_term, sub_term_definition);                                
        });
    };

    this.expand_sub_term = function(sub_term, already_expanding) {
        var definition = this.terms[sub_term] ? this.terms[sub_term] : '(.+)';
        return this.is_expandable(definition) ? this.expand(definition, already_expanding.concat(sub_term)) : definition;
    }

    this.is_defined = function(term) {
        return this.terms[term];
    };

    this.is_expandable = function(definition) {  
        return this.term_pattern.test(definition);
    };    
};


// Understands a macros execution context
Yadda.Environment = function(ctx) {
    this.ctx = ctx ? ctx : {};

    this.merge = function(other_ctx) {
        var merged_ctx = {};
        this.merge_ctx(merged_ctx, other_ctx);
        this.merge_ctx(merged_ctx, this.ctx);
        return new Yadda.Environment(merged_ctx);
    }

    this.merge_ctx = function(ctx1, ctx2) {
        for (var key in ctx2) {
            ctx1[key] = ctx2[key];            
        }; 
    }
}

// Understands appropriateness of macros
Yadda.Competition = function(step, macros) {

    this.results = [];

    var by_score = function(r1, r2) { return r2.score.beats(r1.score); };

    this.clear_winner = function() {
        if (this.number_of_competitors() == 0) throw 'Undefined Step: [' + step + ']';
        if (this.joint_first_place()) throw 'Ambiguous Step: [' + step + ']';
        return this.winner() 
    };   

    this.number_of_competitors = function() {
        return this.results.length;
    };

    this.joint_first_place = function() {
        return (this.number_of_competitors() > 1) && this.results[0].score.equals(this.results[1].score); 
    };

    this.winner = function() {
        return this.results[0].macro;
    };

    this.rank = function(step, macros) {
        this.results = macros.collect(function(macro) {
            return { macro: macro, score: new Yadda.LevenshteinDistanceScore(step, macro.levenshtein_signature()) }
        }).sort( by_score );
    };

    this.rank(step, Yadda.Util.ensure_array(macros));
};

// Understands similarity of two strings
Yadda.LevenshteinDistanceScore = function(s1, s2) {
    
    this.s1 = s1;
    this.s2 = s2;
    this.distanceTable;
    this.value;
    this.type = 'LevenshteinDistanceScore';

    this.initDistanceTable = function() {

        var x = this.s1.length;
        var y = this.s2.length;

        this.distanceTable = new Array(x + 1);

        for (i = 0; i <= x; i++) {
            this.distanceTable[i] = new Array(y + 1);
        }

        for (var i = 0; i <= x; i++) {
            for (var j = 0; j <= y; j++) {
                this.distanceTable[i][j] = 0;
            }
        }

        for (var i = 0; i <= x; i++) {
            this.distanceTable[i][0] = i;
        }

        for (var j = 0; j <= y; j++) {
            this.distanceTable[0][j] = j;
        }
    };

    this.score = function() {

        if (this.s1 == this.s2) {
            return 0;
        }

        var s1Length = this.s1.length;
        var s2Length = this.s2.length;

        for (var j = 0; j < s2Length; j++) {
            for (var i = 0; i < s1Length; i++) {
                if (this.s1[i] == this.s2[j]) {
                    this.distanceTable[i+1][j+1] = this.distanceTable[i][j];
                } else {
                    var deletion = this.distanceTable[i][j+1] + 1;
                    var insertion = this.distanceTable[i+1][j] + 1;
                    var substitution = this.distanceTable[i][j] + 1;

                    this.distanceTable[i+1][j+1] = Math.min(substitution, deletion, insertion)
                }
            }
        }

        this.value = this.distanceTable[s1Length][s2Length];
    };

    this.beats = function(other) {
        return this.value < other.value;
    } 

    this.equals = function(other) {
        if (!other) return false;
        return (this.type == other.type && this.value == other.value);
    }   

    this.toString = function() {
        return "Levenshtein Distance = " + this.value
    }

    this.initDistanceTable();
    this.score();
};

// Wrapper for JavaScript Regular Expressions
Yadda.RegularExpression = function(pattern_or_regexp) {

    var groups_pattern = /(^|[^\\\\])\(.*?\)/g;
    var sets_pattern = /(^|[^\\\\])\[.*?\]/g;
    var repetitions_pattern = /(^|[^\\\\])\{.*?\}/g;
    var regex_aliases_pattern = /(^|[^\\\\])\\./g;
    var non_word_tokens_pattern = /[^\w\s]/g;

    this.init = function(pattern_or_regexp) {
        this.regexp = this.ensure_regexp(pattern_or_regexp);
        this.source = this.regexp.source;
    };

    this.ensure_regexp = function(pattern_or_regexp) {
        return new RegExp(pattern_or_regexp);
    };

    this.test = function(text) {
        var result = this.regexp.test(text);
        this.reset();        
        return result;
    };

    this.groups = function(text) {
        var results = Yadda.Util.ensure_array([]);
        this.each_group(text, function() {
            results.push(Array.prototype.slice.call(arguments, 0))
        });
        return results;
    };   

    this.each_match = function(text, fn) {
        while (match = this.regexp.exec(text)) {
            fn(match[0])
        }
        this.reset();
    };

    this.each_group = function(text, fn) {

        var match = this.regexp.exec(text);

        if (this.regexp.global) {
            while (match) {
                var groups = match.slice(1, match.length);
                fn.apply(undefined, groups);
                match = this.regexp.exec(text)
            }
            this.reset();
        } else if (match) {
            var groups = match.splice(1, match.length - 1);
            fn.apply(undefined, groups);
        }

    };   

    this.equals = function(other) {
        return this.toString() == other.toString();
    };

    this.undress = function() {
        return this.source.replace(groups_pattern, '$1')
                          .replace(sets_pattern, '$1')
                          .replace(repetitions_pattern, '$1')
                          .replace(regex_aliases_pattern, '$1')
                          .replace(non_word_tokens_pattern, '');
    };

    this.reset = function() {
        this.regexp.lastIndex = 0;
        return this;
    }

    this.toString = function() {
        return "/" + this.source + "/";
    };

    this.init(pattern_or_regexp);
};


// Utility functions
Yadda.Util = {
    ensure_array: function(obj) {
        var array = obj ? [].concat(obj) : [];
        array.ensure_array = this.curry(array, this.ensure_array);
        array.in_array = this.curry(array, this.in_array, array);
        array.each = this.curry(array, this.each, array);
        array.collect = this.curry(array, this.collect, array);
        array.push_all = this.curry(array, this.push_all, array);
        array.find_all = this.curry(array, this.find_all, array);
        array.find = this.curry(array, this.find, array);
        array.curry = this.curry(array, this.curry);
        return array;
    },

    in_array: function(items, item) {

        var found = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i] == item) {
                found = true;
                break;
            }
        }

        return found;
    },    

    each: function(items, fn) { 
        var result;
        for (var i = 0; i < items.length; i++) {
            result = fn(items[i]);
        };
        return result;
    },

    collect: function(items, fn) {
        var results = [];
        for (var i = 0; i < items.length; i++) {
            results.push(fn(items[i]));
        }
        return results;
    },

    push_all: function(items, more_items) {
        var more_items = more_items ? [].concat(more_items) : [];
        for (var i = 0; i < more_items.length; i++) {
            items.push(more_items[i]);
        }        
    },

    find_all: function(items, test) {
        var results = this.ensure_array([]);
        for (var i = 0; i < items.length; i++) {
            if (test(items[i])) {
                results.push(items[i]);
            }
        }
        return results;
    },

    find: function(items, test) {        
        var result;
        for (var i = 0; i < items.length; i++) {
            if (test(items[i])) {
                result = items[i];                
                break;
            }
        };
        return result;
    },

    curry: function(ctx, fn) {
        var slice = Array.prototype.slice;
        var args = slice.apply(arguments, [2]);
        return function() {
            return fn.apply(ctx, args.concat(slice.apply(arguments)));
        }
    },

    bind: function(ctx, fn) {
        return function() {
            return fn.apply(ctx, arguments[0][0]);
        };
    }    
}
