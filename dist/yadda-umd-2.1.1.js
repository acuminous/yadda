require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var fn = require('./fn');

module.exports = function (obj) {
  function ensure_array(obj) {
    var array = obj ? [].concat(obj) : [];
    array.in_array = fn.curry(array, in_array, array);
    array.each = fn.curry(array, each, array);
    array.each_async = fn.curry(array, each_async, array);
    array.collect = fn.curry(array, collect, array);
    array.collect_async = fn.curry(array, collect_async, array);
    array.flatten = fn.curry(array, flatten, array);
    array.inject = fn.curry(array, inject, array);
    array.push_all = fn.curry(array, push_all, array);
    array.fill = fn.curry(array, fill, array);
    array.find_all = fn.curry(array, find_all, array);
    array.find = fn.curry(array, find, array);
    array.last = fn.curry(array, last, array);
    array.naked = fn.curry(array, naked, array);
    return array;
  }

  function is_array(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  function in_array(items, item) {
    for (var i = 0; i < items.length; i++) {
      if (items[i] === item) {
        return true;
      }
    }
  }

  function flatten(items) {
    if (!is_array(items)) return [items];
    if (items.length === 0) return items;
    var head = flatten(items[0]);
    var tail = flatten(items.slice(1));
    return ensure_array(head.concat(tail));
  }

  function each(items, iterator) {
    var result;
    for (var i = 0; i < items.length; i++) {
      result = iterator(items[i], i);
    }
    return result;
  }

  function each_async(items, iterator, callback) {
    callback = callback || fn.noop;
    if (!items.length) return callback();
    var index = 0;
    var iterate = function () {
      iterator(items[index], index, function (err, result) {
        if (err) return callback(err);
        if (++index >= items.length) return callback(null, result);
        iterate();
      });
    };
    iterate();
  }

  function collect(items, iterator) {
    var results = ensure_array();
    for (var i = 0; i < items.length; i++) {
      results.push(iterator(items[i], i));
    }
    return results;
  }

  function collect_async(items, iterator, callback) {
    var results = ensure_array();
    each_async(
      items,
      function (item, index, each_callback) {
        iterator(item, index, function (err) {
          if (err) return each_callback(err);
          results.push_all(Array.prototype.splice.call(arguments, 1));
          each_callback();
        });
      },
      function (err) {
        if (err) return callback(err);
        callback(null, results);
      }
    );
  }

  function inject(items, default_value, iterator) {
    var result = default_value;
    for (var i = 0; i < items.length; i++) {
      result = iterator(result, items[i]);
    }
    return result;
  }

  function push_all(items, more_items) {
    more_items = more_items ? [].concat(more_items) : [];
    for (var i = 0; i < more_items.length; i++) {
      items.push(more_items[i]);
    }
    return items;
  }

  function fill(items, item, num) {
    for (var i = 0; i < num; i++) {
      items.push(item);
    }
    return items;
  }

  function find_all(items, test) {
    var results = ensure_array();
    for (var i = 0; i < items.length; i++) {
      if (test(items[i], i)) {
        results.push(items[i]);
      }
    }
    return results;
  }

  function find(items, test) {
    var result;
    for (var i = 0; i < items.length; i++) {
      if (test(items[i], i)) {
        result = items[i];
        break;
      }
    }
    return result;
  }

  function last(items) {
    return items[items.length - 1];
  }

  function naked(items) {
    return [].concat(items);
  }

  return ensure_array(obj);
};

},{"./fn":22}],2:[function(require,module,exports){
'use strict';

var LevenshteinDistanceScore = require('./scores/LevenshteinDistanceScore');
var SameLibraryScore = require('./scores/SameLibraryScore');
var MultiScore = require('./scores/MultiScore');
var $ = require('./Array');

// Understands appropriateness of macros in relation to a specific step
var Competition = function (step, macros, last_macro) {
  var results = [];

  this.validate = function () {
    if (is_undefined()) return { step: step, valid: false, reason: 'Undefined Step' };
    if (is_ambiguous()) return { step: step, valid: false, reason: 'Ambiguous Step (Patterns [' + winning_patterns() + '] are all equally good candidates)' };
    return { step: step, valid: true, winner: this.winner() };
  };

  this.clear_winner = function () {
    if (is_undefined()) throw new Error('Undefined Step: [' + step + ']');
    if (is_ambiguous()) throw new Error('Ambiguous Step: [' + step + ']. Patterns [' + winning_patterns() + '] match equally well.');
    return this.winner();
  };

  function is_undefined() {
    return results.length === 0;
  }

  function is_ambiguous() {
    return results.length > 1 && results[0].score.equals(results[1].score);
  }

  this.winner = function () {
    return results[0].macro;
  };

  function winning_patterns() {
    return results.find_all(by_winning_score).collect(macro_signatures).join(', ');
  }

  function rank(step, macros) {
    results = macros
      .collect(function (macro) {
        return {
          macro: macro,
          score: new MultiScore([new LevenshteinDistanceScore(step, macro.levenshtein_signature()), new SameLibraryScore(macro, last_macro)]),
        };
      })
      .sort(by_ascending_score);
  }

  function by_ascending_score(a, b) {
    return b.score.compare(a.score);
  }

  function by_winning_score(result) {
    return result.score.equals(results[0].score);
  }

  function macro_signatures(result) {
    return result.macro.toString();
  }

  rank(step, $(macros));
};

module.exports = Competition;

},{"./Array":1,"./scores/LevenshteinDistanceScore":46,"./scores/MultiScore":47,"./scores/SameLibraryScore":48}],3:[function(require,module,exports){
'use strict';

// Constructs an object that macros will be bound to before execution
var Context = function (properties) {
  // I was previously getting some weird errors using instanceof to determine if
  // the "other" object was a context object. Using pTFUHht733hM6wfnruGLgAu6Uqvy7MVp instead
  this.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp = true;
  this.properties = {};

  this.merge = function (other) {
    if (other && other.pTFUHht733hM6wfnruGLgAu6Uqvy7MVp) return this.merge(other.properties);
    return new Context(this.properties)._merge(other);
  };

  this._merge = function (other) {
    for (var key in other) {
      this.properties[key] = other[key];
    }
    return this;
  };

  this._merge(properties);
};

module.exports = Context;

},{}],4:[function(require,module,exports){
'use strict';

var $ = require('./Array');
var RegularExpression = require('./RegularExpression');
var pass_through_converter = require('./converters/pass-through-converter');

// Understands term definitions
var Dictionary = function (prefix) {
  // eslint-disable-next-line no-redeclare
  var prefix = prefix || '$';
  var definitions = {};
  var term_grouping_pattern = new RegularExpression(new RegExp('(?:^|[^\\\\])\\' + prefix + '(\\w+)', 'g'));
  var term_splitting_pattern = new RegExp('(\\' + prefix + '\\w+)');
  var _this = this;

  this.define = function (term, pattern, converters) {
    if (is_defined(term)) throw new Error('Duplicate term: [' + term + ']');
    if (converters && is_expandable(pattern)) throw new Error('Expandable terms cannot use converters: [' + term + ']');
    if (converters && !is_compatible(converters, pattern)) throw new Error('Wrong number of converters for: [' + term + ']');

    if (!is_expandable(pattern) && !converters) converters = get_matching_group_converters(pattern);
    definitions[term] = { pattern: normalise(pattern), converters: $(converters) };
    return this;
  };

  this.merge = function (other) {
    if (other._prefix() !== this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');
    return new Dictionary(prefix)._merge(this)._merge(other);
  };

  this._merge = function (other) {
    other.each(function (term, definition) {
      _this.define(term, definition.pattern);
    });
    return this;
  };

  this._prefix = function () {
    return prefix;
  };

  this.each = function (callback) {
    for (var term in definitions) {
      callback(term, definitions[term]);
    }
  };

  this.expand = function (signature, already_expanding) {
    var text = normalise(signature);
    return is_expandable(text) ? { pattern: expand_sub_terms(text, $(already_expanding)), converters: get_converters(text) } : { pattern: text, converters: get_converters(text) };
  };

  function expand_sub_terms(text, already_expanding) {
    return get_sub_terms(text).each(function (sub_term) {
      if (already_expanding.in_array(sub_term)) throw new Error('Circular Definition: [' + already_expanding.join(', ') + ']');
      var sub_term_grouping_pattern = expand_sub_term(sub_term, already_expanding);
      text = text.replace(prefix + sub_term, sub_term_grouping_pattern);
      return text;
    });
  }

  function get_sub_terms(text) {
    return term_grouping_pattern.groups(text);
  }

  function expand_sub_term(sub_term, already_expanding) {
    var pattern = definitions[sub_term] ? definitions[sub_term].pattern : '(.+)';
    return is_expandable(pattern) ? _this.expand(pattern, already_expanding.concat(sub_term)).pattern : pattern;
  }

  function normalise(pattern) {
    return pattern.toString().replace(/^\/|\/$/g, '');
  }

  function is_defined(term) {
    return !!definitions[term];
  }

  function is_expandable(text) {
    return term_grouping_pattern.test(text);
  }

  function is_compatible(converters, pattern) {
    return count_converter_arguments(converters) === count_matching_groups(pattern);
  }

  function get_converters(text) {
    return $(text.split(term_splitting_pattern)).inject($(), function (converters, fragment) {
      return converters.push_all(is_expandable(fragment) ? get_sub_term_converters(fragment) : get_matching_group_converters(fragment));
    });
  }

  function get_matching_group_converters(text) {
    return $().fill(pass_through_converter, count_matching_groups(text));
  }

  function get_sub_term_converters(text) {
    return get_sub_terms(text).inject($(), function (converters, sub_term) {
      return is_defined(sub_term) ? converters.push_all(definitions[sub_term].converters) : converters.push_all(get_converters(expand_sub_term(sub_term, [])));
    });
  }

  function count_matching_groups(pattern) {
    return new RegExp(pattern + '|').exec('').length - 1;
  }

  function count_converter_arguments(converters) {
    return $(converters).inject(0, function (sum, converter) {
      return sum + converter.length - 1;
    });
  }
};

module.exports = Dictionary;

},{"./Array":1,"./RegularExpression":12,"./converters/pass-through-converter":20}],5:[function(require,module,exports){
'use strict';

var $ = require('./Array');
var fn = require('./fn');
var event_bus = new EventBus();

// A communication channel between event emitters and event listeners
function EventBus() {
  var event_handlers = $();

  this.send = function (event_name, event_data, next) {
    if (arguments.length === 1) return this.send(event_name, {});
    if (arguments.length === 2 && fn.is_function(event_data)) return this.send(event_name, {}, event_data);
    notify_handlers(event_name, event_data);
    next && next();
    return this;
  };

  this.on = function (event_pattern, callback) {
    event_handlers.push({ pattern: event_pattern, callback: callback });
    return this;
  };

  var notify_handlers = function (event_name, event_data) {
    find_handlers(event_name).each(function (callback) {
      callback({ name: event_name, data: event_data });
    });
  };

  var find_handlers = function (event_name) {
    return event_handlers
      .find_all(function (handler) {
        return new RegExp(handler.pattern).test(event_name);
      })
      .collect(function (handler) {
        return handler.callback;
      });
  };
}

function instance() {
  return event_bus;
}

module.exports = {
  instance: instance,
  ON_SCENARIO: '__ON_SCENARIO__',
  ON_STEP: '__ON_STEP__',
  ON_EXECUTE: '__ON_EXECUTE__',
  ON_DEFINE: '__ON_DEFINE__',
};

},{"./Array":1,"./fn":22}],6:[function(require,module,exports){
'use strict';

var FileSearch = require('./FileSearch');

var FeatureFileSearch = function (directories) {
  this.constructor(directories, /.*\.(?:feature|spec|specification)$/);
};
FeatureFileSearch.prototype = new FileSearch();

module.exports = FeatureFileSearch;

},{"./FileSearch":7}],7:[function(require,module,exports){
'use strict';

var shims = require('./shims/index');
var path = shims.path;
var fs = shims.fs;
var $ = require('./Array');

// Searches for files in the given directories and their sub-directories, matching at least one of the given patterns
var FileSearch = function (directories, patterns) {
  // eslint-disable-next-line no-redeclare
  var patterns = patterns || /.*/;

  this.each = function (fn) {
    this.list().forEach(fn);
  };

  this.list = function () {
    return $(directories).inject($(), function (files, directory) {
      return files.concat(list_files(directory).find_all(by_pattern));
    });
  };

  var list_files = function (directory) {
    return $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));
  };

  var list_immediate_files = function (directory) {
    return ls(directory).find_all(by_file);
  };

  var list_sub_directory_files = function (directory) {
    return ls(directory)
      .find_all(by_directory)
      .inject($(), function (files, directory) {
        return files.concat(list_files(directory));
      });
  };

  var ls = function (directory) {
    if (!fs.existsSync(directory)) return $();
    return $(fs.readdirSync(directory)).collect(function (file) {
      return path.join(directory, file);
    });
  };

  var by_file = function (file) {
    return !by_directory(file);
  };

  var by_directory = function (file) {
    return fs.statSync(file).isDirectory();
  };

  var by_pattern = function (filename) {
    return $(patterns).find(function (pattern) {
      return new RegExp(pattern).test(filename);
    });
  };
};

module.exports = FileSearch;

},{"./Array":1,"./shims/index":49}],8:[function(require,module,exports){
'use strict';

var Competition = require('./Competition');
var Context = require('./Context');
var EventBus = require('./EventBus');
var $ = require('./Array');
var fn = require('./fn');

// Understands a scenario
var Interpreter = function (libraries) {
  // eslint-disable-next-line no-redeclare
  var libraries = $(libraries);
  var event_bus = EventBus.instance();
  var last_macro;
  var _this = this;

  this.requires = function (libs) {
    libraries.push_all(libs);
    return this;
  };

  this.validate = function (scenario) {
    var results = $(scenario).collect(function (step) {
      var report = _this.rank_macros(step).validate();
      last_macro = report.winner;
      return report;
    });
    if (results.find(by_invalid_step)) throw new Error('Scenario cannot be interpreted\n' + results.collect(validation_report).join('\n'));
  };

  function by_invalid_step(result) {
    return !result.valid;
  }

  function validation_report(result) {
    return result.step + (result.valid ? '' : ' <-- ' + result.reason);
  }

  this.interpret = function (scenario, scenario_context, next) {
    scenario_context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });
    var iterator = make_step_iterator(scenario_context, next);
    $(scenario).each_async(iterator, next);
  };

  var make_step_iterator = function (scenario_context, next) {
    var iterator = function (step, index, callback) {
      _this.interpret_step(step, scenario_context, callback);
    };
    return next ? iterator : fn.asynchronize(null, iterator);
  };

  this.interpret_step = function (step, scenario_context, next) {
    var context = new Context().merge(scenario_context);
    event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });
    var macro = this.rank_macros(step).clear_winner();
    last_macro = macro;
    macro.interpret(step, context || {}, next);
  };

  this.rank_macros = function (step) {
    return new Competition(step, compatible_macros(step), last_macro);
  };

  var compatible_macros = function (step) {
    return libraries.inject([], function (macros, library) {
      return macros.concat(library.find_compatible_macros(step));
    });
  };
};

module.exports = Interpreter;

},{"./Array":1,"./Competition":2,"./Context":3,"./EventBus":5,"./fn":22}],9:[function(require,module,exports){
'use strict';

var Macro = require('./Macro');
var Dictionary = require('./Dictionary');
var $ = require('./Array');

// Understands how to index macros
var Library = function (dictionary) {
  // eslint-disable-next-line no-redeclare
  var dictionary = dictionary || new Dictionary();
  var macros = $();
  var _this = this;

  this.define = function (signatures, fn, macro_context, options) {
    $(signatures).each(function (signature) {
      define_macro(signature, fn, macro_context, options);
    });
    return this;
  };

  var define_macro = function (signature, fn, macro_context, options) {
    if (_this.get_macro(signature)) throw new Error('Duplicate macro: [' + signature + ']');
    macros.push(new Macro(signature, dictionary.expand(signature), fn, macro_context, _this, options));
  };

  this.get_macro = function (signature) {
    return macros.find(function (other_macro) {
      return other_macro.is_identified_by(signature);
    });
  };

  this.find_compatible_macros = function (step) {
    return macros.find_all(function (macro) {
      return macro.can_interpret(step);
    });
  };
};

module.exports = Library;

},{"./Array":1,"./Dictionary":4,"./Macro":10}],10:[function(require,module,exports){
'use strict';

var fn = require('./fn');
var $ = require('./Array');
var Context = require('./Context');
var RegularExpression = require('./RegularExpression');
var EventBus = require('./EventBus');

// Understands how to invoke a step
var Macro = function (signature, parsed_signature, macro, macro_context, library, options) {
  /* eslint-disable no-redeclare */
  var signature = normalise(signature);
  var signature_pattern = new RegularExpression(parsed_signature.pattern);
  var macro = macro || fn.async_noop;
  var event_bus = EventBus.instance();
  var options = options || {};
  /* eslint-enable no-redeclare */

  this.library = library;

  this.is_identified_by = function (other_signature) {
    return signature === normalise(other_signature);
  };

  this.can_interpret = function (step) {
    return signature_pattern.test(step);
  };

  this.interpret = function (step, scenario_context, next) {
    var context = new Context({ step: step }).merge(macro_context).merge(scenario_context);
    convert(signature_pattern.groups(step), function (err, args) {
      if (err) return next(err);
      event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });
      var result;
      try {
        result = fn.invoke(macro, context.properties, is_sync(args) ? args : args.concat(next));
      } catch (err) {
        if (next) return next(err);
        throw err;
      }
      if (is_promise(result)) return result.then(fn.noargs(next)).catch(next);
      if (is_sync(args)) return next && next();
    });
  };

  this.is_sibling = function (other_macro) {
    return other_macro && other_macro.defined_in(library);
  };

  this.defined_in = function (other_library) {
    return library === other_library;
  };

  this.levenshtein_signature = function () {
    return signature_pattern.without_expressions();
  };

  this.toString = function () {
    return signature;
  };

  function is_promise(result) {
    if (options.mode) return options.mode === 'promise';
    return result && result.then;
  }

  function is_sync(args) {
    if (options.mode) return options.mode === 'sync';
    return macro !== fn.async_noop && macro.length !== args.length + 1;
  }

  function normalise(signature) {
    return new RegExp(signature).toString();
  }

  function convert(args, next) {
    var index = 0;
    return $(parsed_signature.converters)
      .collect(function (converter) {
        return function (callback) {
          converter.apply(null, args.slice(index, (index += converter.length - 1)).concat(callback));
        };
      })
      .collect_async(function (converter, index, callback) {
        converter(callback);
      }, next);
  }

  event_bus.send(EventBus.ON_DEFINE, { signature: signature, pattern: signature_pattern.toString() });
};

module.exports = Macro;

},{"./Array":1,"./Context":3,"./EventBus":5,"./RegularExpression":12,"./fn":22}],11:[function(require,module,exports){
(function (process,global,__dirname){(function (){
'use strict';

module.exports = Platform;

function Platform() {
  function get_container() {
    /* eslint-disable no-undef */
    if (is_browser()) return window;
    if (is_phantom()) return phantom;
    if (is_node()) return global;
    /* eslint-enable no-undef */
  }

  function is_node() {
    return typeof process !== 'undefined' && typeof global !== 'undefined' && typeof __dirname !== 'undefined';
  }

  function is_browser() {
    return typeof window !== 'undefined';
  }

  function is_phantom() {
    return typeof phantom !== 'undefined';
  }

  function is_karma() {
    return typeof window !== 'undefined' && typeof window.__karma__ !== 'undefined';
  }

  return {
    get_container: get_container,
    is_node: is_node,
    is_browser: is_browser,
    is_phantom: is_phantom,
    is_karma: is_karma,
  };
}

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},"/lib")
},{"_process":58}],12:[function(require,module,exports){
'use strict';

var $ = require('./Array');

// Wrapper for JavaScript Regular Expressions
var RegularExpression = function (pattern_or_regexp) {
  var groups_pattern = /(^|[^\\\\])\(.*?\)/g;
  var sets_pattern = /(^|[^\\\\])\[.*?\]/g;
  var repetitions_pattern = /(^|[^\\\\])\{.*?\}/g;
  var regex_aliases_pattern = /(^|[^\\\\])\\./g;
  var non_word_tokens_pattern = /[^\w\s]/g;
  var regexp = new RegExp(pattern_or_regexp);

  this.test = function (text) {
    var result = regexp.test(text);
    this.reset();
    return result;
  };

  this.groups = function (text) {
    var results = $();
    var match = regexp.exec(text);
    while (match) {
      var groups = match.slice(1, match.length);
      results.push(groups);
      match = regexp.global && regexp.exec(text);
    }
    this.reset();
    return results.flatten();
  };

  this.reset = function () {
    regexp.lastIndex = 0;
    return this;
  };

  this.without_expressions = function () {
    return regexp.source.replace(groups_pattern, '$1').replace(sets_pattern, '$1').replace(repetitions_pattern, '$1').replace(regex_aliases_pattern, '$1').replace(non_word_tokens_pattern, '');
  };

  this.equals = function (other) {
    return this.toString() === other.toString();
  };

  this.toString = function () {
    return '/' + regexp.source + '/';
  };
};

module.exports = RegularExpression;

},{"./Array":1}],13:[function(require,module,exports){
'use strict';

module.exports = {
  trim: function trim(text) {
    return text.replace(/^\s+|\s+$/g, '');
  },
  rtrim: function rtrim(text) {
    return text.replace(/\s+$/g, '');
  },
  isBlank: function isBlank(text) {
    return /^\s*$/g.test(text);
  },
  isNotBlank: function isNotBlank(text) {
    return !this.isBlank(text);
  },
  indentation: function indentation(text) {
    var match = /^(\s*)/.exec(text);
    return (match && match[0].length) || 0;
  },
};

},{}],14:[function(require,module,exports){
/*jslint node: true */
'use strict';

var Interpreter = require('./Interpreter');
var Context = require('./Context');
var fn = require('./fn');

var Yadda = function (libraries, interpreter_context) {
  if (!(this instanceof Yadda)) {
    return new Yadda(libraries, interpreter_context);
  }

  this.interpreter = new Interpreter(libraries);

  this.requires = function (libraries) {
    this.interpreter.requires(libraries);
    return this;
  };

  this.yadda = function (scenario, scenario_context, next) {
    if (arguments.length === 0) return this;
    if (arguments.length === 2 && fn.is_function(scenario_context)) return this.yadda(scenario, {}, scenario_context);
    this.interpreter.validate(scenario);
    this.interpreter.interpret(scenario, new Context().merge(interpreter_context).merge(scenario_context), next);
  };

  // Not everyone shares my sense of humour re the recursive api :(
  // See https://github.com/acuminous/yadda/issues/111
  this.run = this.yadda;

  this.toString = function () {
    return 'Yadda 2.1.1 Copyright 2010 Stephen Cresswell';
  };
};

module.exports = Yadda;

},{"./Context":3,"./Interpreter":8,"./fn":22}],15:[function(require,module,exports){
'use strict';

module.exports = function date_converter(value, next) {
  var converted = Date.parse(value);
  if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to a date'));
  return next(null, new Date(converted));
};

},{}],16:[function(require,module,exports){
'use strict';

module.exports = function float_converter(value, next) {
  var converted = parseFloat(value);
  if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to a float'));
  return next(null, converted);
};

},{}],17:[function(require,module,exports){
'use strict';

module.exports = {
  date: require('./date-converter'),
  integer: require('./integer-converter'),
  float: require('./float-converter'),
  list: require('./list-converter'),
  table: require('./table-converter'),
  pass_through: require('./pass-through-converter'),
};

},{"./date-converter":15,"./float-converter":16,"./integer-converter":18,"./list-converter":19,"./pass-through-converter":20,"./table-converter":21}],18:[function(require,module,exports){
'use strict';

module.exports = function integer_converter(value, next) {
  var converted = parseInt(value);
  if (isNaN(converted)) return next(new Error('Cannot convert [' + value + '] to an integer'));
  return next(null, converted);
};

},{}],19:[function(require,module,exports){
'use strict';

module.exports = function list_converter(value, next) {
  return next(null, value.split(/\n/));
};

},{}],20:[function(require,module,exports){
'use strict';

module.exports = function pass_through_converter(value, next) {
  return next(null, value);
};

},{}],21:[function(require,module,exports){
'use strict';

var $ = require('../Array');
var StringUtils = require('../StringUtils');
var COLUMN_SEPARATOR_REGEX = /[\|\u2506]/;
var OUTER_BORDERS_REGEX = /^[\|\u2506]|[\|\u2506]$/g;
var DASH_REGEX = /^[\\|\u2506]?-{3,}/;

module.exports = function table_converter(value, next) {
  var rows = value.split(/\n/);
  var headings = parse_headings(rows.shift());
  var handler = is_horizinal_separator(rows[0]) ? handle_multiline_row : handle_single_line_row;
  var table = $();

  try {
    $(rows).each(handler);
    next(null, collapse(table));
  } catch (err) {
    next(err);
  }

  function handle_single_line_row(row) {
    if (is_horizinal_separator(row)) throw new Error('Dashes are unexpected at this time');
    start_new_row();
    parse_fields(row);
  }

  function handle_multiline_row(row) {
    if (is_horizinal_separator(row)) return start_new_row();
    parse_fields(row);
  }

  function parse_headings(row) {
    return $(row.replace(OUTER_BORDERS_REGEX, '').split(COLUMN_SEPARATOR_REGEX))
      .collect(function (value) {
        return { text: StringUtils.trim(value), indentation: StringUtils.indentation(value) };
      })
      .naked();
  }

  function is_horizinal_separator(row) {
    return DASH_REGEX.test(row);
  }

  function start_new_row() {
    table.push({});
  }

  function parse_fields(row) {
    var fields = table.last();
    $(row.replace(OUTER_BORDERS_REGEX, '').split(COLUMN_SEPARATOR_REGEX)).each(function (field, index) {
      var column = headings[index].text;
      var indentation = headings[index].indentation;
      var text = StringUtils.rtrim(field.substr(indentation));
      if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < indentation) throw new Error('Indentation error');
      fields[column] = (fields[column] || []).concat(text);
    });
  }

  function collapse(table) {
    return table
      .collect(function (row) {
        var new_row = {};
        for (var heading in row) {
          new_row[heading] = row[heading].join('\n');
        }
        return new_row;
      })
      .naked();
  }
};

},{"../Array":1,"../StringUtils":13}],22:[function(require,module,exports){
'use strict';

module.exports = (function () {
  var slice = Array.prototype.slice;

  function curry(ctx, fn) {
    var args = slice.call(arguments, 2);
    return function () {
      return fn.apply(ctx, args.concat(slice.call(arguments)));
    };
  }

  function invoke(fn, ctx, args) {
    return fn.apply(ctx, args);
  }

  function is_function(object) {
    var getType = {};
    return object && getType.toString.call(object) === '[object Function]';
  }

  function noop() {}

  function noargs(fn) {
    return function () {
      return fn();
    };
  }

  function asynchronize(ctx, fn) {
    return function () {
      var next = slice.call(arguments, arguments.length - 1)[0];
      var args = slice.call(arguments, 0, arguments.length - 2);
      fn.apply(ctx, args);
      if (next) next();
    };
  }

  return {
    noop: noop,
    noargs: noargs,
    async_noop: asynchronize(null, noop),
    asynchronize: asynchronize,
    is_function: is_function,
    curry: curry,
    invoke: invoke,
  };
})();

},{}],23:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '[Ff]eature|功能',
    scenario: '(?:[Ss]cenario|[Ss]cenario [Oo]utline|场景|剧本|(?:场景|剧本)?大纲)',
    examples: '(?:[Ee]xamples|[Ww]here|例子|示例|举例|样例)',
    pending: '(?:[Pp]ending|[Tt]odo|待定|待做|待办|暂停|暂缓)',
    only: '(?:[Oo]nly|仅仅?)',
    background: '[Bb]ackground|背景|前提',
    given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept|假如|假设|假定|并且|而且|同时|但是)',
    when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut|当|如果|并且|而且|同时|但是)',
    then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut|那么|期望|并且|而且|同时|但是)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('Chinese', vocabulary);
})();

},{"./Language":28}],24:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ff]eature|[Ff]unctionaliteit|[Ee]igenschap)',
    scenario: '(?:[Ss]cenario|[Gg|eval)',
    examples: '(?:[Vv]oorbeelden?)',
    pending: '(?:[Tt]odo|[Mm]oet nog)',
    only: '(?:[Aa]lleen)',
    background: '(?:[Aa]chtergrond)',
    given: '(?:[Ss]tel|[Gg]egeven(?:\\sdat)?|[Ee]n|[Mm]aar)',
    when: '(?:[Aa]ls|[Ww]anneer|[Ee]n|[Mm]aar)',
    then: '(?:[Dd]an|[Vv]ervolgens|[Ee]n|[Mm]aar)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('Dutch', vocabulary);
})();

},{"./Language":28}],25:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '[Ff]eature',
    scenario: '(?:[Ss]cenario|[Ss]cenario [Oo]utline)',
    examples: '(?:[Ee]xamples|[Ww]here)',
    pending: '(?:[Pp]ending|[Tt]odo)',
    only: '(?:[Oo]nly)',
    background: '[Bb]ackground',
    given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
    when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)',
    then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('English', vocabulary);
})();

},{"./Language":28}],26:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ff]onctionnalité)',
    scenario: '(?:[Ss]cénario|[Pp]lan [Dd]u [Ss]cénario)',
    examples: '(?:[Ee]xemples|[Ee]xemple|[Oo][uù])',
    pending: '(?:[Ee]n attente|[Ee]n cours|[Tt]odo)',
    only: '(?:[Ss]eulement])',
    background: '(?:[Cc]ontexte)',
    given: '(?:[Ss]oit|[ÉéEe]tant données|[ÉéEe]tant donnée|[ÉéEe]tant donnés|[ÉéEe]tant donné|[Aa]vec|[Ee]t|[Mm]ais|[Aa]ttendre)',
    when: "(?:[Qq]uand|[Ll]orsqu'|[Ll]orsque|[Ss]i|[Ee]t|[Mm]ais)",
    then: '(?:[Aa]lors|[Aa]ttendre|[Ee]t|[Mm]ais)',

    _steps: ['given', 'when', 'then', 'soit', 'etantdonnees', 'etantdonnee', 'etantdonne', 'quand', 'lorsque', 'alors'],
    // Also aliasing French verbs for given-when-then for signature-lookup
    get soit() {
      return this.given;
    },
    get etantdonnees() {
      return this.given;
    },
    get etantdonnee() {
      return this.given;
    },
    get etantdonne() {
      return this.given;
    },
    get quand() {
      return this.when;
    },
    get lorsque() {
      return this.when;
    },
    get alors() {
      return this.then;
    },
  };

  return new Language('French', vocabulary);
})();

},{"./Language":28}],27:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ff]unktionalität|[Ff]eature|[Aa]spekt|[Uu]secase|[Aa]nwendungsfall)',
    scenario: '(?:[Ss]zenario|[Ss]zenario( g|G)rundriss|[Gg]eschehnis)',
    examples: '(?:[Bb]eispiele?)',
    pending: '(?:[Tt]odo|[Oo]ffen)',
    only: '(?:[Nn]ur|[Ee]inzig)',
    background: '(?:[Gg]rundlage|[Hh]intergrund|[Ss]etup|[Vv]orausgesetzt)',
    given: '(?:[Aa]ngenommen|[Gg]egeben( sei(en)?)?|[Mm]it|[Uu]nd|[Aa]ber|[Aa]ußer)',
    when: '(?:[Ww]enn|[Ff]alls|[Uu]nd|[Aa]ber)',
    then: '(?:[Dd]ann|[Ff]olglich|[Aa]ußer|[Uu]nd|[Aa]ber)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('German', vocabulary);
})();

},{"./Language":28}],28:[function(require,module,exports){
'use strict';

var Library = require('../Library');
var $ = require('../Array');

module.exports = function (name, vocabulary) {
  var _this = this;

  // See http://github.com/acuminous/yadda#203
  this.is_language = true;

  this.library = function (dictionary) {
    return _this.localise_library(new Library(dictionary));
  };

  this.localise_library = function (library) {
    $(vocabulary._steps).each(function (keyword) {
      library[keyword] = function (signatures, fn, ctx, options) {
        return $(signatures).each(function (signature) {
          signature = prefix_signature(_this.localise(keyword), signature);
          return library.define(signature, fn, ctx, options);
        });
      };
    });
    return library;
  };

  var prefix_signature = function (prefix, signature) {
    var regex_delimiters = new RegExp('^/|/$', 'g');
    var start_of_signature = new RegExp(/^(?:\^)?/);
    var one_or_more_spaces = '\\s+';
    var leading_spaces = '^(?:\\s)*';
    return signature
      .toString()
      .replace(regex_delimiters, '')
      .replace(start_of_signature, leading_spaces + prefix + one_or_more_spaces);
  };

  this.localise = function (keyword) {
    if (vocabulary[keyword] === undefined) throw new Error('Keyword "' + keyword + '" has not been translated into ' + name + '.');
    return vocabulary[keyword];
  };
};

},{"../Array":1,"../Library":9}],29:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '[Ee]genskap',
    scenario: '[Ss]cenario',
    examples: '[Ee]ksempler',
    pending: '[Aa]vventer',
    only: '[Bb]are',
    background: '[Bb]akgrunn',
    given: '(?:[Gg]itt|[Mm]ed|[Oo]g|[Mm]en|[Uu]nntatt)',
    when: '(?:[Nn]år|[Oo]g|[Mm]en)',
    then: '(?:[Ss]å|[Ff]forvent|[Oo]g|[Mm]en)',
    _steps: ['given', 'when', 'then', 'gitt', 'når', 'så'],
    // Also aliasing Norwegian verbs for given-when-then for signature-lookup
    get gitt() {
      return this.given;
    },
    get når() {
      return this.when;
    },
    get så() {
      return this.then;
    },
  };

  return new Language('Norwegian', vocabulary);
})();

},{"./Language":28}],30:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Tt]ale|[Yy]arn)',
    scenario: '(?:[Aa]dventure|[Ss]ortie)',
    examples: '[Ww]herest',
    pending: '[Bb]rig',
    only: '[Bb]lack [Ss]pot',
    background: '[Aa]ftground',
    given: '(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',
    when: '(?:[Ww]hence|[Ii]f|[Aa]nd|[Bb]ut)',
    then: '(?:[Tt]hence|[Ee]xpect|[Aa]nd|[Bb]ut)',
    _steps: ['given', 'when', 'then', 'giveth', 'whence', 'thence'],
    // Also aliasing Pirate verbs for given-when-then for signature-lookup
    get giveth() {
      return this.given;
    },
    get whence() {
      return this.when;
    },
    get thence() {
      return this.then;
    },
  };

  return new Language('Pirate', vocabulary);
})();

},{"./Language":28}],31:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ww]łaściwość|[Ff]unkcja|[Aa]spekt|[Pp]otrzeba [Bb]iznesowa)',
    scenario: '(?:[Ss]cenariusz|[Ss]zablon [Ss]cenariusza)',
    examples: '[Pp]rzykłady',
    pending: '(?:[Oo]czekujący|[Nn]iezweryfikowany|[Tt]odo)',
    only: '[Tt]ylko',
    background: '[Zz]ałożenia',
    given: '(?:[Zz]akładając|[Mm]ając|[Oo]raz|[Ii]|[Aa]le)',
    when: '(?:[Jj]eżeli|[Jj]eśli|[Gg]dy|[Kk]iedy|[Oo]raz|[Ii]|[Aa]le)',
    then: '(?:[Ww]tedy|[Oo]raz|[Ii]|[Aa]le)',
    _steps: ['given', 'when', 'then', 'zakladajac', 'majac', 'jezeli', 'jesli', 'gdy', 'kiedy', 'wtedy'],
    // Also aliasing Polish verbs for given-when-then for signature-lookup
    get zakladajac() {
      return this.given;
    },
    get majac() {
      return this.given;
    },
    get jezeli() {
      return this.when;
    },
    get jesli() {
      return this.when;
    },
    get gdy() {
      return this.when;
    },
    get kiedy() {
      return this.when;
    },
    get wtedy() {
      return this.then;
    },
  };

  return new Language('Polish', vocabulary);
})();

},{"./Language":28}],32:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ff]uncionalidade|[Cc]aracter[íi]stica)',
    scenario: '(?:[Cc]en[aá]rio|[Cc]aso)',
    examples: '(?:[Ee]xemplos|[Ee]xemplo)',
    pending: '[Pp]endente',
    only: '[S][óo]',
    background: '[Ff]undo',
    given: '(?:[Ss]eja|[Ss]ejam|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas|[Ee]|[Mm]as)',
    when: '(?:[Qq]uando|[Ss]e|[Qq]ue|[Ee]|[Mm]as)',
    then: '(?:[Ee]nt[aã]o|[Ee]|[Mm]as)',

    _steps: ['given', 'when', 'then', 'seja', 'sejam', 'dado', 'dada', 'dados', 'dadas', 'quando', 'se', 'entao'],

    get seja() {
      return this.given;
    },
    get sejam() {
      return this.given;
    },
    get dado() {
      return this.given;
    },
    get dada() {
      return this.given;
    },
    get dados() {
      return this.given;
    },
    get dadas() {
      return this.given;
    },
    get quando() {
      return this.when;
    },
    get se() {
      return this.when;
    },
    get entao() {
      return this.then;
    },
  };

  return new Language('Portuguese', vocabulary);
})();

},{"./Language":28}],33:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Фф]ункция|[Фф]ункционал|[Сс]войство)',
    scenario: 'Сценарий',
    examples: 'Примеры?',
    pending: '(?:[Ww]ip|[Tt]odo)',
    only: 'Только',
    background: '(?:[Пп]редыстория|[Кк]онтекст)',
    given: '(?:[Дд]опустим|[Дд]ано|[Пп]усть|[Ии]|[Н]о)(?:\\s[Яя])?',
    when: '(?:[Ее]сли|[Кк]огда|[Ии]|[Н]о)(?:\\s[Яя])?',
    then: '(?:[Тт]о|[Тт]огда|[Ии]|[Н]о)(?:\\s[Яя])?',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('Russian', vocabulary);
})();

},{"./Language":28}],34:[function(require,module,exports){
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Ff]uncionalidad|[Cc]aracterística)',
    scenario: '(?:[Ee]scenario|[Cc]aso)',
    examples: '(?:[Ee]jemplos|[Ee]jemplo)',
    pending: '[Pp]endiente',
    only: '[S]ólo',
    background: '[Ff]ondo',
    given: '(?:[Ss]ea|[Ss]ean|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas)',
    when: '(?:[Cc]uando|[Ss]i|[Qq]ue)',
    then: '(?:[Ee]ntonces)',

    _steps: ['given', 'when', 'then', 'sea', 'sean', 'dado', 'dada', 'dados', 'dadas', 'cuando', 'si', 'entonces'],

    get sea() {
      return this.given;
    },
    get sean() {
      return this.given;
    },
    get dado() {
      return this.given;
    },
    get dada() {
      return this.given;
    },
    get dados() {
      return this.given;
    },
    get dadas() {
      return this.given;
    },
    get cuando() {
      return this.when;
    },
    get si() {
      return this.when;
    },
    get entonces() {
      return this.then;
    },
  };

  return new Language('Spanish', vocabulary);
})();

},{"./Language":28}],35:[function(require,module,exports){
/**
 * Author: Oleksii Kuznietsov
 * https://github.com/Bloodhound1982
 */
/* jslint node: true */
'use strict';

var Language = require('./Language');

module.exports = (function () {
  var vocabulary = {
    feature: '(?:[Фф]ункція|[Фф]ункціонал|[Пп]отреба|[Аа]спект|[Оо]собливість|[Вв]ластивість)',
    scenario: '(?:[Сс]ценарій|[Шш]аблон)',
    examples: '[Пп]риклади',
    pending: '(?:[Нн]еперевірений|[Чч]екаючий|[Pp]ending|[Tt]odo)',
    only: '[Тт]ільки',
    background: '[Кк]онтекст',
    given: '(?:[Дд]ано|[Пп]ри|[Нн]ехай|[Іі]|[Тт]а|[Аа]ле)',
    when: '(?:[Яя]кщо|[Дд]е|[Кк]оли|[Іі]|[Тт]а|[Аа]ле)',
    then: '(?:[Тт]оді|[Іі]|[Тт]а|[Аа]ле)',
    _steps: ['given', 'when', 'then'],
  };

  return new Language('Ukrainian', vocabulary);
})();

},{"./Language":28}],36:[function(require,module,exports){
'use strict';

module.exports = {
  Chinese: require('./Chinese'),
  English: require('./English'),
  French: require('./French'),
  German: require('./German'),
  Dutch: require('./Dutch'),
  Norwegian: require('./Norwegian'),
  Pirate: require('./Pirate'),
  Ukrainian: require('./Ukrainian'),
  Polish: require('./Polish'),
  Spanish: require('./Spanish'),
  Russian: require('./Russian'),
  Portuguese: require('./Portuguese'),
  default: require('./English'),
  Language: require('./Language'),
};

},{"./Chinese":23,"./Dutch":24,"./English":25,"./French":26,"./German":27,"./Language":28,"./Norwegian":29,"./Pirate":30,"./Polish":31,"./Portuguese":32,"./Russian":33,"./Spanish":34,"./Ukrainian":35}],37:[function(require,module,exports){
'use strict';

var FeatureFileParser = function (options) {
  var fs = require('../shims').fs;
  var FeatureParser = require('./FeatureParser');
  var parser = new FeatureParser(options);

  this.parse = function (file, next) {
    var text = fs.readFileSync(file, 'utf8');
    var feature = parser.parse(text);
    return (next && next(feature)) || feature;
  };
};

module.exports = FeatureFileParser;

},{"../shims":49,"./FeatureParser":38}],38:[function(require,module,exports){
'use strict';

var $ = require('../Array');
var fn = require('../fn');
var StringUtils = require('../StringUtils');
var Localisation = require('../localisation');

var FeatureParser = function (options) {
  /* eslint-disable no-redeclare */
  var defaults = { language: Localisation.default, leftPlaceholderChar: '[', rightPlaceholderChar: ']' };
  var options = options && options.is_language ? { language: options } : options || defaults;
  var language = options.language || defaults.language;
  var left_placeholder_char = options.leftPlaceholderChar || defaults.leftPlaceholderChar;
  var right_placeholder_char = options.rightPlaceholderChar || defaults.rightPlaceholderChar;
  /* eslint-enable no-redeclare */

  var FEATURE_REGEX = new RegExp('^\\s*' + language.localise('feature') + ':\\s*(.*)', 'i');
  var SCENARIO_REGEX = new RegExp('^\\s*' + language.localise('scenario') + ':\\s*(.*)', 'i');
  var BACKGROUND_REGEX = new RegExp('^\\s*' + language.localise('background') + ':\\s*(.*)', 'i');
  var EXAMPLES_REGEX = new RegExp('^\\s*' + language.localise('examples') + ':', 'i');
  var TEXT_REGEX = new RegExp('^(.*)$', 'i');
  var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\s*#');
  var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\s*#{3,}');
  var BLANK_REGEX = new RegExp('^(\\s*)$');
  var DASH_REGEX = new RegExp('(^\\s*[\\|\u2506]?-{3,})');
  var SIMPLE_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)$');
  var NVP_ANNOTATION_REGEX = new RegExp('^\\s*@([^=]*)=(.*)$');

  var specification;
  var comment;

  this.parse = function (text, next) {
    reset();
    split(text).each(parse_line);
    return (next && next(specification.export())) || specification.export();
  };

  function reset() {
    specification = new Specification();
    comment = false;
  }

  function split(text) {
    return $(text.split(/\r\n|\n/));
  }

  function parse_line(line, index) {
    var match;
    var line_number = index + 1;
    try {
      // eslint-disable-next-line no-return-assign
      if ((match = MULTI_LINE_COMMENT_REGEX.test(line))) return (comment = !comment);
      if (comment) return;
      if ((match = SINGLE_LINE_COMMENT_REGEX.test(line))) return;
      if ((match = SIMPLE_ANNOTATION_REGEX.exec(line))) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: true }, line_number);
      if ((match = NVP_ANNOTATION_REGEX.exec(line))) return specification.handle('Annotation', { key: StringUtils.trim(match[1]), value: StringUtils.trim(match[2]) }, line_number);
      if ((match = FEATURE_REGEX.exec(line))) return specification.handle('Feature', match[1], line_number);
      if ((match = SCENARIO_REGEX.exec(line))) return specification.handle('Scenario', match[1], line_number);
      if ((match = BACKGROUND_REGEX.exec(line))) return specification.handle('Background', match[1], line_number);
      if ((match = EXAMPLES_REGEX.exec(line))) return specification.handle('Examples', line_number);
      if ((match = BLANK_REGEX.exec(line))) return specification.handle('Blank', match[0], line_number);
      if ((match = DASH_REGEX.exec(line))) return specification.handle('Dash', match[1], line_number);
      if ((match = TEXT_REGEX.exec(line))) return specification.handle('Text', match[1], line_number);
    } catch (e) {
      e.message = 'Error parsing line ' + line_number + ', "' + line + '".\nOriginal error was: ' + e.message;
      throw e;
    }
  }

  var Handlers = function (handlers) {
    // eslint-disable-next-line no-redeclare
    var handlers = handlers || {};

    this.register = function (event, handler) {
      handlers[event] = handler;
    };

    this.unregister = function () {
      $(Array.prototype.slice.call(arguments)).each(function (event) {
        delete handlers[event];
      });
    };

    this.find = function (event) {
      if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');
      return { handle: handlers[event.toLowerCase()] };
    };
  };

  var Specification = function () {
    var current_element = this;
    var feature;
    var annotations = new Annotations();
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
      annotations.stash(annotation.key, annotation.value);
    }

    function start_feature(event, title) {
      // eslint-disable-next-line no-return-assign
      return (feature = new Feature(title, annotations, new Annotations()));
    }

    function start_scenario(event, title, line_number) {
      feature = new Feature(title, new Annotations(), annotations);
      return feature.on(event, title, line_number);
    }

    var start_background = start_scenario;

    this.handle = function (event, data, line_number) {
      current_element = current_element.on(event, data, line_number);
    };

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = function () {
      if (!feature) throw new Error('A feature must contain one or more scenarios');
      return feature.export();
    };
  };

  var Annotations = function () {
    var annotations = {};

    this.stash = function (key, value) {
      if (/\s/.test(key)) throw new Error('Invalid annotation: ' + key);
      annotations[key.toLowerCase()] = value;
    };

    this.export = function () {
      return annotations;
    };
  };

  var Feature = function (title, annotations, stashed_annotations) {
    var description = [];
    var scenarios = [];
    var background = new NullBackground();
    var handlers = new Handlers({
      text: capture_description,
      blank: fn.noop,
      annotation: stash_annotation,
      scenario: start_scenario,
      background: start_background,
    });
    var _this = this;

    function start_background(event, title) {
      background = new Background(title, _this);
      stashed_annotations = new Annotations();
      return background;
    }

    function stash_annotation(event, annotation) {
      handlers.unregister('background', 'text');
      stashed_annotations.stash(annotation.key, annotation.value);
    }

    function capture_description(event, text) {
      description.push(StringUtils.trim(text));
    }

    function start_scenario(event, title) {
      var scenario = new Scenario(title, background, stashed_annotations, _this);
      scenarios.push(scenario);
      stashed_annotations = new Annotations();
      return scenario;
    }

    function validate() {
      if (scenarios.length === 0) throw new Error('Feature requires one or more scenarios');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = function () {
      validate();
      return {
        title: title,
        annotations: annotations.export(),
        description: description,
        scenarios: $(scenarios)
          .collect(function (scenario) {
            return scenario.export();
          })
          .flatten()
          .naked(),
      };
    };
  };

  var Background = function (title, feature) {
    var steps = [];
    var blanks = [];
    var indentation = 0;
    var handlers = new Handlers({
      text: capture_step,
      blank: fn.noop,
      annotation: stash_annotation,
      scenario: start_scenario,
    });

    function capture_step(event, text, line_number) {
      handlers.register('dash', enable_multiline_step);
      steps.push(StringUtils.trim(text));
    }

    function enable_multiline_step(event, text, line_number) {
      handlers.unregister('dash', 'annotation', 'scenario');
      handlers.register('text', start_multiline_step);
      handlers.register('blank', stash_blanks);
      indentation = StringUtils.indentation(text);
    }

    function start_multiline_step(event, text, line_number) {
      handlers.register('dash', disable_multiline_step);
      handlers.register('text', continue_multiline_step);
      handlers.register('blank', stash_blanks);
      handlers.register('annotation', stash_annotation);
      handlers.register('scenario', start_scenario);
      append_to_step(text, '\n');
    }

    function continue_multiline_step(event, text, line_number) {
      unstash_blanks();
      append_to_step(text, '\n');
    }

    function stash_blanks(event, text, line_number) {
      blanks.push(text);
    }

    function unstash_blanks() {
      if (!blanks.length) return;
      append_to_step(blanks.join('\n'), '\n');
      blanks = [];
    }

    function disable_multiline_step(event, text, line_number) {
      handlers.unregister('dash');
      handlers.register('text', capture_step);
      handlers.register('blank', fn.noop);
      unstash_blanks();
    }

    function append_to_step(text, prefix) {
      if (StringUtils.isNotBlank(text) && StringUtils.indentation(text) < indentation) throw new Error('Indentation error');
      steps[steps.length - 1] = steps[steps.length - 1] + prefix + StringUtils.rtrim(text.substr(indentation));
    }

    function stash_annotation(event, annotation, line_number) {
      validate();
      return feature.on(event, annotation, line_number);
    }

    function start_scenario(event, data, line_number) {
      validate();
      return feature.on(event, data, line_number);
    }

    function validate() {
      if (steps.length === 0) throw new Error('Background requires one or more steps');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = function () {
      validate();
      return {
        steps: steps,
      };
    };
  };

  var NullBackground = function () {
    var handlers = new Handlers();

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = function () {
      return {
        steps: [],
      };
    };
  };

  var Scenario = function (title, background, annotations, feature) {
    var description = [];
    var steps = [];
    var blanks = [];
    var examples;
    var indentation = 0;
    var handlers = new Handlers({
      text: capture_step,
      blank: fn.noop,
      annotation: start_scenario,
      scenario: start_scenario,
      examples: start_examples,
    });
    var _this = this;

    function capture_step(event, text, line_number) {
      handlers.register('dash', enable_multiline_step);
      steps.push(StringUtils.trim(text));
    }

    function enable_multiline_step(event, text, line_number) {
      handlers.unregister('dash', 'annotation', 'scenario', 'examples');
      handlers.register('text', start_multiline_step);
      handlers.register('blank', stash_blanks);
      indentation = StringUtils.indentation(text);
    }

    function start_multiline_step(event, text, line_number) {
      handlers.register('dash', disable_multiline_step);
      handlers.register('text', continue_multiline_step);
      handlers.register('blank', stash_blanks);
      handlers.register('annotation', start_scenario);
      handlers.register('scenario', start_scenario);
      handlers.register('examples', start_examples);
      append_to_step(text, '\n');
    }

    function continue_multiline_step(event, text, line_number) {
      unstash_blanks();
      append_to_step(text, '\n');
    }

    function stash_blanks(event, text, line_number) {
      blanks.push(text);
    }

    function unstash_blanks() {
      if (!blanks.length) return;
      append_to_step(blanks.join('\n'), '\n');
      blanks = [];
    }

    function disable_multiline_step(event, text, line_number) {
      handlers.unregister('dash');
      handlers.register('text', capture_step);
      handlers.register('blank', fn.noop);
      unstash_blanks();
    }

    function append_to_step(text, prefix) {
      if (StringUtils.isNotBlank(text) && StringUtils.indentation(text) < indentation) throw new Error('Indentation error');
      steps[steps.length - 1] = steps[steps.length - 1] + prefix + StringUtils.rtrim(text.substr(indentation));
    }

    function start_scenario(event, data, line_number) {
      validate();
      return feature.on(event, data, line_number);
    }

    function start_examples(event, data, line_number) {
      validate();
      examples = new Examples(_this);
      return examples;
    }

    function validate() {
      if (steps.length === 0) throw new Error('Scenario requires one or more steps');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.export = function () {
      validate();
      var result = {
        title: title,
        annotations: annotations.export(),
        description: description,
        steps: background.export().steps.concat(steps),
      };
      return examples ? examples.expand(result) : result;
    };
  };

  var Examples = function (scenario) {
    var headings = [];
    var examples = $();
    var annotations = new Annotations();
    var handlers = new Handlers({
      blank: fn.noop,
      dash: start_example_table,
      text: capture_headings,
    });

    function start_example_table(evnet, data, line_number) {
      handlers.unregister('blank', 'dash');
    }

    function capture_headings(event, data, line_number) {
      handlers.register('annotation', stash_annotation);
      handlers.register('text', capture_singleline_fields);
      handlers.register('dash', enable_multiline_examples);
      var pos = 1;
      headings = split(data)
        .collect(function (column) {
          var attributes = { text: StringUtils.trim(column), left: pos, indentation: StringUtils.indentation(column) };
          pos += column.length + 1;
          return attributes;
        })
        .naked();
    }

    function stash_annotation(event, annotation, line_number) {
      handlers.unregister('blank', 'dash');
      annotations.stash(annotation.key, annotation.value);
    }

    function capture_singleline_fields(event, data, line_number) {
      handlers.register('dash', end_example_table);
      handlers.register('blank', end_example_table);
      examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
      add_meta_fields(line_number);
      annotations = new Annotations();
    }

    function enable_multiline_examples(event, data, line_number) {
      handlers.register('text', start_capturing_multiline_fields);
      handlers.register('dash', stop_capturing_multiline_fields);
    }

    function start_capturing_multiline_fields(event, data, line_number) {
      handlers.register('text', continue_capturing_multiline_fields);
      handlers.register('dash', stop_capturing_multiline_fields);
      handlers.register('blank', end_example_table);
      examples.push({ annotations: annotations, fields: parse_fields(data, {}) });
      add_meta_fields(line_number);
    }

    function continue_capturing_multiline_fields(event, data, line_number) {
      parse_fields(data, examples.last().fields);
    }

    function stop_capturing_multiline_fields(event, data, line_number) {
      handlers.register('text', start_capturing_multiline_fields);
      annotations = new Annotations();
    }

    function end_example_table(event, data, line_number) {
      handlers.unregister('text', 'dash');
      handlers.register('blank', fn.noop);
      handlers.register('annotation', start_scenario);
      handlers.register('scenario', start_scenario);
    }

    function add_meta_fields(line_number) {
      var fields = examples.last().fields;
      $(headings).each(function (heading) {
        fields[heading.text + '.index'] = [examples.length];
        fields[heading.text + '.start.line'] = [line_number];
        fields[heading.text + '.start.column'] = [heading.left + heading.indentation];
      });
    }

    function parse_fields(row, fields) {
      split(row, headings.length).each(function (field, index) {
        var column = headings[index].text;
        var indentation = headings[index].indentation;
        var text = StringUtils.rtrim(field.substr(indentation));
        if (StringUtils.isNotBlank(field) && StringUtils.indentation(field) < indentation) throw new Error('Indentation error');
        fields[column] = (fields[column] || []).concat(text);
      });
      return fields;
    }

    function split(row, number_of_fields) {
      var separator = row.indexOf('\u2506') >= 0 ? '\u2506' : '|';
      var fields = $(row.split(separator));
      if (number_of_fields !== undefined && number_of_fields !== fields.length) {
        throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);
      }
      return fields;
    }

    function start_scenario(event, data, line_number) {
      validate();
      return scenario.on(event, data, line_number);
    }

    function validate() {
      if (headings.length === 0) throw new Error('Examples table requires one or more headings');
      if (examples.length === 0) throw new Error('Examples table requires one or more rows');
    }

    this.on = function (event, data, line_number) {
      return handlers.find(event).handle(event, data, line_number) || this;
    };

    this.expand = function (scenario) {
      validate();
      return examples
        .collect(function (example) {
          return {
            title: substitute(example.fields, scenario.title),
            annotations: shallow_merge(example.annotations.export(), scenario.annotations),
            description: substitute_all(example, scenario.description),
            steps: substitute_all(example.fields, scenario.steps),
          };
        })
        .naked();
    };

    function shallow_merge() {
      var result = {};
      $(Array.prototype.slice.call(arguments)).each(function (annotations) {
        for (var key in annotations) {
          result[key] = annotations[key];
        }
      });
      return result;
    }

    function substitute_all(example, lines) {
      return $(lines)
        .collect(function (line) {
          return substitute(example, line);
        })
        .naked();
    }

    function substitute(example, line) {
      for (var heading in example) {
        line = line.replace(new RegExp('\\' + left_placeholder_char + '\\s*' + heading + '\\s*\\' + right_placeholder_char, 'g'), StringUtils.rtrim(example[heading].join('\n')));
      }
      return line;
    }
  };
};

module.exports = FeatureParser;

},{"../Array":1,"../StringUtils":13,"../fn":22,"../localisation":36}],39:[function(require,module,exports){
'use strict';

var $ = require('../Array');

var StepParser = function () {
  var NON_BLANK_REGEX = /[^\s]/;

  this.parse = function (text, next) {
    var steps = split(text).find_all(non_blanks);
    return (next && next(steps)) || steps;
  };

  var split = function (text) {
    return $(text.split(/\n/));
  };

  var non_blanks = function (text) {
    return text && NON_BLANK_REGEX.test(text);
  };
};

module.exports = StepParser;

},{"../Array":1}],40:[function(require,module,exports){
'use strict';

module.exports = {
  StepParser: require('./StepParser'),
  FeatureParser: require('./FeatureParser'),
  FeatureFileParser: require('./FeatureFileParser'),
};

},{"./FeatureFileParser":37,"./FeatureParser":38,"./StepParser":39}],41:[function(require,module,exports){
(function (global){(function (){
'use strict';

if (!module.client) {
  var fs = require('../shims').fs;
  global.process = global.process || {
    cwd: function () {
      return fs.workingDirectory;
    },
  };
}

module.exports = function (yadda, casper) {
  var EventBus = require('yadda').EventBus;

  yadda.interpreter.interpret_step = function (step, ctx, next) {
    var _this = this;
    casper.then(function () {
      casper.test.info(step);
      EventBus.instance().send(EventBus.ON_STEP, { step: step, ctx: ctx });
      _this.rank_macros(step).clear_winner().interpret(step, ctx, next);
    });
  };

  casper.yadda = function (script, ctx) {
    if (script === undefined) return this;
    yadda.run(script, ctx);
  };
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../shims":49,"yadda":"yadda"}],42:[function(require,module,exports){
'use strict';

module.exports = {
  casper: require('./CasperPlugin'),
  mocha: {
    ScenarioLevelPlugin: require('./mocha/ScenarioLevelPlugin'),
    StepLevelPlugin: require('./mocha/StepLevelPlugin'),
  },
  get jasmine() {
    return this.mocha;
  },
};

},{"./CasperPlugin":41,"./mocha/ScenarioLevelPlugin":44,"./mocha/StepLevelPlugin":45}],43:[function(require,module,exports){
'use strict';

var Localisation = require('../../localisation');
var Platform = require('../../Platform');
var FeatureFileParser = require('../../parsers/FeatureFileParser');
var $ = require('../../Array');

module.exports.create = function (options) {
  /* jslint shadow: true */
  var platform = new Platform();
  var language = options.language || Localisation.default;
  var parser = options.parser || new FeatureFileParser(language);
  var container = options.container || platform.get_container();

  function featureFiles(files, iterator) {
    $(files).each(function (file) {
      features(parser.parse(file), iterator);
    });
  }

  function features(features, iterator) {
    $(features).each(function (feature) {
      describe(feature.title, feature, iterator);
    });
  }

  function describe(title, subject, iterator) {
    var _describe = getDescribe(subject.annotations);
    _describe(title, function () {
      iterator(subject);
    });
  }

  function it_async(title, subject, iterator) {
    var _it = getIt(subject.annotations);
    _it(title, function (done) {
      iterator(this, subject, done);
    });
  }

  function it_sync(title, subject, iterator) {
    var _it = getIt(subject.annotations);
    _it(title, function () {
      iterator(this, subject);
    });
  }

  function getIt(annotations, next) {
    if (has_annotation(annotations, 'pending')) return container.xit;
    if (has_annotation(annotations, 'only')) return container.it.only || container.fit || container.iit;
    return container.it;
  }

  function getDescribe(annotations, next) {
    if (has_annotation(annotations, 'pending')) return container.xdescribe;
    if (has_annotation(annotations, 'only')) return container.describe.only || container.fdescribe || container.ddescribe;
    return container.describe;
  }

  function has_annotation(annotations, name) {
    var regexp = new RegExp('^' + language.localise(name) + '$', 'i');
    for (var key in annotations) {
      if (regexp.test(key)) return true;
    }
  }

  return {
    featureFiles: featureFiles,
    features: features,
    describe: describe,
    it_async: it_async,
    it_sync: it_sync,
  };
};

},{"../../Array":1,"../../Platform":11,"../../localisation":36,"../../parsers/FeatureFileParser":37}],44:[function(require,module,exports){
'use strict';

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function (options) {
  // eslint-disable-next-line no-redeclare
  var options = options || {};
  var platform = new Platform();
  var container = options.container || platform.get_container();

  var base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each(function (scenario) {
      var itFn = iterator.length === 1 ? base_plugin.it_sync : base_plugin.it_async;
      itFn(scenario.title, scenario, function (context, scenario, done) {
        iterator(scenario, done);
      });
    });
  }

  container.featureFiles = container.featureFile = base_plugin.featureFiles;
  container.features = container.feature = base_plugin.features;
  container.scenarios = container.scenario = scenarios;
};

},{"../../Array":1,"../../Platform":11,"./BasePlugin":43}],45:[function(require,module,exports){
'use strict';

var $ = require('../../Array');
var Platform = require('../../Platform');
var BasePlugin = require('./BasePlugin');

module.exports.init = function (options) {
  // eslint-disable-next-line no-redeclare
  var options = options || {};
  var platform = new Platform();
  var container = options.container || platform.get_container();

  var base_plugin = BasePlugin.create(options);

  function scenarios(scenarios, iterator) {
    $(scenarios).each(function (scenario) {
      base_plugin.describe(scenario.title, scenario, iterator);
    });
  }

  function steps(steps, iterator) {
    var abort = false;

    $(steps).each(function (step) {
      var stepFn = iterator.length === 1 ? step_sync : step_async;
      stepFn(step, iterator);
    });

    function step_async(step, iterator) {
      base_plugin.it_async(step, step, function (context, step, done) {
        if (abort) {
          return context.skip ? context.skip() : done();
        }
        abort = true;
        iterator.bind(context)(step, function (err) {
          if (err) return (done.fail || done)(err);
          abort = false;
          done();
        });
      });
    }

    function step_sync(step, iterator) {
      base_plugin.it_sync(step, step, function (context, step) {
        if (abort) return context.skip && context.skip();
        abort = true;
        iterator.bind(context)(step);
        abort = false;
      });
    }
  }

  container.featureFiles = container.featureFile = base_plugin.featureFiles;
  container.features = container.feature = base_plugin.features;
  container.scenarios = container.scenario = scenarios;
  container.steps = steps;
};

},{"../../Array":1,"../../Platform":11,"./BasePlugin":43}],46:[function(require,module,exports){
'use strict';

// Understands similarity of two strings
var LevenshteinDistanceScore = function (s1, s2) {
  this.value;
  this.type = 'LevenshteinDistanceScore';
  var distance_table;
  var _this = this;

  var initialise = function () {
    var x = s1.length;
    var y = s2.length;

    distance_table = new Array(x + 1);

    /* eslint-disable no-redeclare */
    for (var i = 0; i <= x; i++) {
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
    /* eslint-enable no-redeclare */
  };

  var score = function () {
    // eslint-disable-next-line no-return-assign
    if (s1 === s2) return (_this.value = 0);

    for (var j = 0; j < s2.length; j++) {
      for (var i = 0; i < s1.length; i++) {
        if (s1[i] === s2[j]) {
          distance_table[i + 1][j + 1] = distance_table[i][j];
        } else {
          var deletion = distance_table[i][j + 1] + 1;
          var insertion = distance_table[i + 1][j] + 1;
          var substitution = distance_table[i][j] + 1;
          distance_table[i + 1][j + 1] = Math.min(substitution, deletion, insertion);
        }
      }
    }
    _this.value = distance_table[s1.length][s2.length];
  };

  this.compare = function (other) {
    return other.value - this.value;
  };

  this.equals = function (other) {
    if (!other) return false;
    return this.type === other.type && this.value === other.value;
  };

  initialise();
  score();
};

module.exports = LevenshteinDistanceScore;

},{}],47:[function(require,module,exports){
'use strict';

var $ = require('../Array');

var MultiScore = function (scores) {
  this.scores = $(scores);
  this.type = 'MultiScore';

  this.compare = function (other) {
    for (var i = 0; i < this.scores.length; i++) {
      var difference = this.scores[i].compare(other.scores[i]);
      if (difference) return difference;
    }
    return 0;
  };

  this.equals = function (other) {
    if (!other) return false;
    if (this.type !== other.type) return false;
    return this.compare(other) === 0;
  };
};

module.exports = MultiScore;

},{"../Array":1}],48:[function(require,module,exports){
'use strict';

var SameLibraryScore = function (m1, m2) {
  this.value = m1.is_sibling(m2) ? 1 : 0;
  this.type = 'SameLibraryScore';

  this.compare = function (other) {
    return this.value - other.value;
  };

  this.equals = function (other) {
    if (!other) return false;
    return this.type === other.type && this.value === other.value;
  };
};

module.exports = SameLibraryScore;

},{}],49:[function(require,module,exports){
(function (process){(function (){
'use strict';

var Platform = require('../Platform');

module.exports = (function () {
  var platform = new Platform();

  var shims = {
    node: function () {
      return {
        fs: require('fs'),
        path: require('path'),
        process: process,
      };
    },
    phantom: function () {
      return {
        fs: require('./phantom-fs'),
        path: require('./phantom-path'),
        process: require('./phantom-process'),
      };
    },
    karma: function () {
      return {
        fs: require('./karma-fs'),
        path: require('./karma-path'),
        process: require('./karma-process'),
      };
    },
  };

  function get_shim() {
    if (platform.is_phantom()) return shims.phantom();
    if (platform.is_browser() && platform.is_karma()) return shims.karma();
    if (platform.is_node()) return shims.node();
    return {};
  }

  return get_shim();
})();

}).call(this)}).call(this,require('_process'))
},{"../Platform":11,"./karma-fs":50,"./karma-path":51,"./karma-process":52,"./phantom-fs":53,"./phantom-path":54,"./phantom-process":55,"_process":58,"fs":56,"path":57}],50:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  var path = require('./karma-path');

  function absolutePath(relativePath) {
    return path.resolve(path.normalize(relativePath.split('\\').join('/')));
  }

  var KarmaFileSystem = function () {
    this.registry = new KarmaPathRegistry();
    this.converter = new KarmaUriPathConverter('/base/', '/');
    this.reader = new KarmaFileReader(this.converter);

    var servedUris = Object.keys(window.__karma__.files);
    var servedFiles = this.converter.parseUris(servedUris);
    servedFiles.forEach(this.registry.addFile, this.registry);
  };
  KarmaFileSystem.prototype = {
    constructor: KarmaFileSystem,
    workingDirectory: '/',
    existsSync: function (path) {
      return this.registry.exists(path);
    },
    readdirSync: function (path) {
      return this.registry.getContent(path);
    },
    statSync: function (path) {
      return {
        isDirectory: function () {
          return this.registry.isDirectory(path);
        }.bind(this),
      };
    },
    readFileSync: function (file, encoding) {
      if (encoding !== 'utf8') throw new Error('This fs.readFileSync() shim does not support other than utf8 encoding.');
      if (!this.registry.isFile(file)) throw new Error('File does not exist: ' + file);
      return this.reader.readFile(file);
    },
  };

  var KarmaPathRegistry = function KarmaPathRegistry() {
    this.paths = {};
  };

  KarmaPathRegistry.prototype = {
    constructor: KarmaPathRegistry,
    addFile: function (file) {
      file = absolutePath(file);
      this.paths[file] = KarmaPathRegistry.TYPE_FILE;
      var parentDirectory = path.dirname(file);
      this.addDirectory(parentDirectory);
    },
    addDirectory: function (directory) {
      directory = absolutePath(directory);
      this.paths[directory] = KarmaPathRegistry.TYPE_DIRECTORY;
      var parentDirectory = path.dirname(directory);
      if (parentDirectory !== directory) this.addDirectory(parentDirectory);
    },
    isFile: function (file) {
      file = absolutePath(file);
      return this.exists(file) && this.paths[file] === KarmaPathRegistry.TYPE_FILE;
    },
    isDirectory: function (directory) {
      directory = absolutePath(directory);
      return this.exists(directory) && this.paths[directory] === KarmaPathRegistry.TYPE_DIRECTORY;
    },
    exists: function (node) {
      node = absolutePath(node);
      return this.paths.hasOwnProperty(node);
    },
    getContent: function (directory) {
      if (!this.isDirectory(directory)) throw new Error('Not a directory: ' + directory);
      directory = absolutePath(directory);
      return Object.keys(this.paths)
        .filter(function (node) {
          if (node === directory) return false;
          var parentDirectory = path.dirname(node);
          return parentDirectory === directory;
        }, this)
        .map(function (node) {
          return path.basename(node);
        });
    },
  };

  KarmaPathRegistry.TYPE_FILE = 0;
  KarmaPathRegistry.TYPE_DIRECTORY = 1;

  var KarmaUriPathConverter = function KarmaUriPathConverter(baseUri, workingDirectory) {
    this.workingDirectory = workingDirectory;
    this.workingDirectoryPattern = this.patternFromBase(workingDirectory);
    this.baseUri = baseUri;
    this.baseUriPattern = this.patternFromBase(baseUri);
  };

  KarmaUriPathConverter.prototype = {
    constructor: KarmaUriPathConverter,
    patternFromBase: function (string, flags) {
      var pattern = '^' + string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(pattern, flags);
    },
    parseUris: function (uris) {
      return uris
        .filter(function (uri) {
          return this.baseUriPattern.test(uri);
        }, this)
        .map(function (uri) {
          return uri.replace(this.baseUriPattern, this.workingDirectory);
        }, this);
    },
    buildUri: function (file) {
      file = absolutePath(file);
      if (!this.workingDirectoryPattern.test(file)) throw new Error('Path is not in working directory: ' + file);
      return file.replace(this.workingDirectoryPattern, this.baseUri);
    },
  };

  var KarmaFileReader = function KarmaFileReader(converter) {
    this.converter = converter;
  };

  KarmaFileReader.prototype = {
    constructor: KarmaFileReader,
    readFile: function (file) {
      var uri = this.converter.buildUri(file);
      // eslint-disable-next-line no-undef
      var xhr = new XMLHttpRequest();
      xhr.open('get', uri, false);
      xhr.send();
      return xhr.responseText;
    },
  };

  return new KarmaFileSystem();
})();

},{"./karma-path":51}],51:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  var path = {};

  try {
    path = require('path');
  } catch (e) {
    throw new Error("The environment does not support the path module, it's probably not using browserify.");
  }

  if (typeof path.normalize !== 'function' || typeof path.dirname !== 'function') throw new Error('The path module emulation does not contain implementations of required functions.');

  return path;
})();

},{"path":57}],52:[function(require,module,exports){
module.exports = (function () {
  'use strict';

  var fs = require('./karma-fs');
  var process = {};

  process.cwd = function () {
    return fs.workingDirectory;
  };

  return process;
})();

},{"./karma-fs":50}],53:[function(require,module,exports){
'use strict';

module.exports = (function () {
  if (module.client) return {}; // Running in browser, not via node

  var fs = require('fs');

  fs.existsSync = fs.existsSync || fs.exists;

  fs.readdirSync =
    fs.readdirSync ||
    function (path) {
      return fs.list(path).filter(function (name) {
        return name !== '.' && name !== '..';
      });
    };

  fs.statSync =
    fs.statSync ||
    function (path) {
      return {
        isDirectory: function () {
          return fs.isDirectory(path);
        },
      };
    };

  return fs;
})();

},{"fs":56}],54:[function(require,module,exports){
'use strict';

module.exports = (function () {
  if (module.client) return {}; // Running in browser, not via node

  var fs = require('fs');
  var path = {};

  try {
    path = require('path');
  } catch (e) {
    // meh
  }

  path.join =
    path.join ||
    function () {
      return Array.prototype.join.call(arguments, fs.separator);
    };

  path.relative =
    path.relative ||
    function (from, to) {
      return from + fs.separator + to;
    };

  return path;
})();

},{"fs":56,"path":57}],55:[function(require,module,exports){
'use strict';

module.exports = (function () {
  if (module.client) return {}; // Running in browser, not via node

  var fs = require('fs');
  var process = typeof process !== 'undefined' ? process : {};

  process.cwd = function () {
    return fs.workingDirectory;
  };

  return process;
})();

},{"fs":56}],56:[function(require,module,exports){

},{}],57:[function(require,module,exports){
(function (process){(function (){
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

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

'use strict';

function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;

}).call(this)}).call(this,require('_process'))
},{"_process":58}],58:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],"yadda":[function(require,module,exports){
'use strict';

var api = {
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
  converters: require('./converters/index'),
  parsers: require('./parsers/index'),
  plugins: require('./plugins/index'),
  shims: require('./shims/index'),
  createInstance: function () {
    // Not everyone shares my sense of humour re the recursive api :(
    // See https://github.com/acuminous/yadda/issues/111
    return api.Yadda.apply(null, Array.prototype.slice.call(arguments, 0));
  },
};

module.exports = api;

},{"./Context":3,"./Dictionary":4,"./EventBus":5,"./FeatureFileSearch":6,"./FileSearch":7,"./Interpreter":8,"./Library":9,"./Platform":11,"./Yadda":14,"./converters/index":17,"./localisation/index":36,"./parsers/index":40,"./plugins/index":42,"./shims/index":49}]},{},["yadda"]);
