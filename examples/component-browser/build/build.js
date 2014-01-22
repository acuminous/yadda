
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("johntron-yadda/lib/Array.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var fn = require('./fn');\n\
\n\
module.exports = function(obj) {\n\
\n\
    function ensure_array(obj) {\n\
        var array = obj ? [].concat(obj) : [];\n\
        array.in_array = fn.curry(array, in_array, array);\n\
        array.each = fn.curry(array, each, array);\n\
        array.each_async = fn.curry(array, each_async, array);\n\
        array.collect = fn.curry(array, collect, array);\n\
        array.flatten = fn.curry(array, flatten, array);\n\
        array.inject = fn.curry(array, inject, array);\n\
        array.push_all = fn.curry(array, push_all, array);\n\
        array.find_all = fn.curry(array, find_all, array);\n\
        array.find = fn.curry(array, find, array);\n\
        array.naked = fn.curry(array, naked, array);\n\
        return array;\n\
    };\n\
\n\
    function is_array(obj) {\n\
        return Object.prototype.toString.call(obj) === '[object Array]'\n\
    };\n\
\n\
    function in_array(items, item) {\n\
        for (var i = 0; i < items.length; i++) {\n\
            if (items[i] == item) {\n\
                return true;\n\
            }\n\
        }\n\
    };\n\
\n\
    function flatten(items) {\n\
        if (!is_array(items)) return [items];\n\
        if (items.length == 0) return [];\n\
        var head = flatten(items[0]);\n\
        var tail = flatten(items.slice(1));\n\
        return ensure_array(head.concat(tail));\n\
    };\n\
\n\
    function each(items, iterator) {\n\
        var result;\n\
        for (var i = 0; i < items.length; i++) {\n\
            result = iterator(items[i], i);\n\
        };\n\
        return result;\n\
    };\n\
\n\
    function each_async(items, iterator, callback) {\n\
        callback = callback || fn.noop;\n\
        if (!items.length) return callback();\n\
        var completed = 0;\n\
        var iterate = function() {\n\
            iterator(items[completed], completed, function(err, result) {\n\
                if (err) return callback(err);\n\
                if (++completed >= items.length) return callback(null, result);\n\
                iterate();\n\
            });\n\
        };\n\
        iterate();\n\
    };\n\
\n\
    function collect(items, iterator) {\n\
        var results = ensure_array();\n\
        for (var i = 0; i < items.length; i++) {\n\
            results.push(iterator(items[i]));\n\
        }\n\
        return results;\n\
    };\n\
\n\
    function inject(items, default_value, iterator) {\n\
        var result = default_value;\n\
        for (var i = 0; i < items.length; i++) {\n\
            result = iterator(result, items[i]);\n\
        }\n\
        return result;\n\
    };\n\
\n\
    function push_all(items, more_items) {\n\
        var more_items = more_items ? [].concat(more_items) : [];\n\
        for (var i = 0; i < more_items.length; i++) {\n\
            items.push(more_items[i]);\n\
        }\n\
    };\n\
\n\
    function find_all(items, test) {\n\
        var results = ensure_array();\n\
        for (var i = 0; i < items.length; i++) {\n\
            if (test(items[i])) {\n\
                results.push(items[i]);\n\
            }\n\
        };\n\
        return results;\n\
    };\n\
\n\
    function find(items, test) {\n\
        var result;\n\
        for (var i = 0; i < items.length; i++) {\n\
            if (test(items[i])) {\n\
                result = items[i];\n\
                break;\n\
            }\n\
        };\n\
        return result;\n\
    };\n\
\n\
    function naked(items) {\n\
        return [].concat(items);\n\
    };\n\
\n\
    return ensure_array(obj);\n\
};//@ sourceURL=johntron-yadda/lib/Array.js"
));
require.register("johntron-yadda/lib/Competition.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var LevenshteinDistanceScore = require('./LevenshteinDistanceScore');\n\
var $ = require('./Array');\n\
\n\
// Understands appropriateness of macros in relation to a specific step\n\
var Competition = function(step, macros) {\n\
\n\
    var results = [];   \n\
\n\
    this.validate = function() {\n\
        if (is_undefined()) return { step: step, valid: false, reason: 'Undefined Step' };\n\
        if (is_ambiguous()) return { step: step, valid: false, reason: 'Ambiguous Step (Patterns [' + winning_patterns() + '] are all equally good candidates)' };\n\
        return { step: step, valid: true };\n\
    };\n\
\n\
    this.clear_winner = function() {\n\
        if (is_undefined()) throw new Error('Undefined Step: [' + step + ']');\n\
        if (is_ambiguous()) throw new Error('Ambiguous Step: [' + step + ']. Patterns [' + winning_patterns() + '] match equally well.');\n\
        return this.winner();\n\
    };   \n\
\n\
    function is_undefined() {\n\
        return results.length == 0;\n\
    };\n\
\n\
    function is_ambiguous() {\n\
        return (results.length > 1) && results[0].score.equals(results[1].score); \n\
    };\n\
\n\
    this.winner = function() {\n\
        return results[0].macro;\n\
    };\n\
\n\
    function winning_patterns() {\n\
        return results.find_all(by_winning_score).collect(macro_signatures).join(', ');\n\
    };\n\
\n\
    function rank(step, macros) {\n\
        results = macros.collect(function(macro) {\n\
            return { \n\
                macro: macro, \n\
                score: new LevenshteinDistanceScore(step, macro.levenshtein_signature())\n\
            }\n\
        }).sort( by_ascending_score );\n\
    };\n\
\n\
    function by_ascending_score(a, b) { \n\
        return b.score.beats(a.score);\n\
    };\n\
\n\
    function by_winning_score(result) {\n\
        return result.score.equals(results[0].score);\n\
    };\n\
\n\
    function macro_signatures(result) {\n\
        return result.macro.toString();\n\
    };\n\
\n\
    rank(step, $(macros));\n\
};\n\
\n\
module.exports = Competition;//@ sourceURL=johntron-yadda/lib/Competition.js"
));
require.register("johntron-yadda/lib/Context.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
// Constructs an object that macros will be bound to before execution\n\
var Context = function(properties) {\n\
\n\
    this.properties = {};\n\
\n\
    this.merge = function(other) {\n\
        if (other instanceof Context) return this.merge(other.properties);\n\
        return new Context(this.properties)._merge(other);\n\
    };\n\
\n\
    this._merge = function(other) {\n\
        for (var key in other) { this.properties[key] = other[key] }; \n\
        return this;\n\
    };\n\
\n\
    this._merge(properties);\n\
};\n\
\n\
module.exports = Context;//@ sourceURL=johntron-yadda/lib/Context.js"
));
require.register("johntron-yadda/lib/Dictionary.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var $ = require('./Array');\n\
var RegularExpression = require('./RegularExpression');\n\
\n\
// Understands term definitions\n\
var Dictionary = function(prefix) {\n\
\n\
    var prefix = prefix || '$';\n\
    var terms = {};\n\
    var term_pattern = new RegularExpression(new RegExp('(?:^|[^\\\\\\\\])\\\\' + prefix + '(\\\\w+)', 'g'));\n\
    var _this = this;\n\
\n\
    this.define = function(term, definition) {\n\
        if (this.is_defined(term)) throw new Error('Duplicate definition: [' + term + ']');\n\
        terms[term] = normalise(definition);\n\
        return this;\n\
    };\n\
\n\
    this.is_defined = function(term) {\n\
        return terms[term];\n\
    };\n\
\n\
    this.expand = function(term, already_expanding) {\n\
        if (!is_expandable(term)) return term;\n\
        return expand_sub_terms(term, $(already_expanding));\n\
    };\n\
\n\
    this.merge = function(other) {\n\
        if (other._prefix() != this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');\n\
        return new Dictionary(prefix)._merge(this)._merge(other);\n\
    };\n\
\n\
    this._merge = function(other) {\n\
        other.each_term(this.define.bind(this));\n\
        return this;\n\
    };\n\
\n\
    this._prefix = function() {\n\
        return prefix;\n\
    };\n\
\n\
    this.each_term = function(callback) {\n\
        for (key in terms) {\n\
            callback(key, terms[key])\n\
        };\n\
    };\n\
\n\
    var expand_sub_terms = function(term, already_expanding) {\n\
        return get_sub_terms(term).each(function(sub_term) {\n\
            if (already_expanding.in_array(sub_term)) throw new Error('Circular Definition: \\[' + already_expanding.join(', ') + '\\]');\n\
            var sub_term_definition = expand_sub_term(sub_term, already_expanding);\n\
            return term = term.replace(prefix + sub_term, sub_term_definition);\n\
        });\n\
    };\n\
\n\
    var get_sub_terms = function(term) {\n\
        return term_pattern.groups(term);\n\
    }\n\
\n\
    var expand_sub_term = function(sub_term, already_expanding) {\n\
        var definition = terms[sub_term] || '(.+)';\n\
        return is_expandable(definition) ? _this.expand(definition, already_expanding.concat(sub_term)) : definition;\n\
    }\n\
\n\
    var normalise = function(definition) {\n\
        return definition.toString().replace(/^\\/|\\/$/g, '');\n\
    }\n\
\n\
    var is_expandable = function(definition) {\n\
        return term_pattern.test(definition);\n\
    };\n\
};\n\
\n\
\n\
module.exports = Dictionary;//@ sourceURL=johntron-yadda/lib/Dictionary.js"
));
require.register("johntron-yadda/lib/EventBus.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var $ = require('./Array');\n\
var fn = require('./fn');\n\
var event_bus = new EventBus();\n\
\n\
// A communication channel between event emitters and event listeners\n\
function EventBus() {\n\
\n\
    var event_handlers = $();\n\
    var _this = this;\n\
\n\
    this.send = function(event_name, event_data, next) {\n\
        if (arguments.length == 1) return this.send(event_name, {});\n\
        if (arguments.length == 2 && fn.is_function(event_data)) return this.send(event_name, {}, event_data);      \n\
        notify_handlers(event_name, event_data);\n\
        next && next();        \n\
        return this;\n\
    };\n\
\n\
    this.on = function(event_pattern, callback) {\n\
        event_handlers.push({ pattern: event_pattern, callback: callback });\n\
        return this;\n\
    };\n\
\n\
    var notify_handlers = function(event_name, event_data) {\n\
        find_handlers(event_name).each(function(callback) {\n\
            callback({ name: event_name, data: event_data });\n\
        });\n\
    };\n\
\n\
    var find_handlers = function(event_name) {\n\
        return event_handlers.find_all(function(handler) {\n\
            return new RegExp(handler.pattern).test(event_name);\n\
        }).collect(function(handler) {\n\
            return handler.callback;\n\
        });\n\
    };  \n\
};\n\
\n\
function instance() {\n\
    return event_bus;\n\
};\n\
\n\
module.exports = {\n\
    instance: instance,\n\
    ON_SCENARIO: '__ON_SCENARIO__',\n\
    ON_STEP: '__ON_STEP__',\n\
    ON_EXECUTE: '__ON_EXECUTE__'\n\
};//@ sourceURL=johntron-yadda/lib/EventBus.js"
));
require.register("johntron-yadda/lib/FeatureFileSearch.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var FileSearch = require('./FileSearch');\n\
\n\
var FeatureFileSearch = function(directories) {\n\
    this.constructor(directories, /.*\\.(?:feature|spec|specification)$/);\n\
};\n\
FeatureFileSearch.prototype = new FileSearch();\n\
\n\
module.exports = FeatureFileSearch;//@ sourceURL=johntron-yadda/lib/FeatureFileSearch.js"
));
require.register("johntron-yadda/lib/FileSearch.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var shims = require('./shims/index');\n\
var path = shims.path;\n\
var process = shims.process;\n\
var fs = shims.fs;\n\
var $ = require('./Array');\n\
\n\
// Searches for files in the given directories and their sub-directories, matching at least one of the given patterns\n\
var FileSearch = function(directories, patterns) {\n\
\n\
    var patterns = patterns || /.*/;\n\
\n\
    this.each = function(fn) {\n\
        this.list().forEach(fn);\n\
    };\n\
\n\
    this.list = function() {\n\
        return $(directories).inject($(), function(files, directory) {\n\
            return files.concat(list_files(directory).find_all(by_pattern));\n\
        });\n\
    };\n\
\n\
    var list_files = function(directory) {\n\
        return $(list_immediate_files(directory).concat(list_sub_directory_files(directory)));\n\
    };\n\
\n\
    var list_immediate_files = function(directory) {\n\
        return ls(directory).find_all(by_file);\n\
    };\n\
\n\
    var list_sub_directory_files = function(directory) {\n\
        return ls(directory).find_all(by_directory).inject($(), function(files, directory) {\n\
            return files.concat(list_files(directory));\n\
        });\n\
    };\n\
\n\
    var ls = function(directory) {\n\
        if (!fs.existsSync(directory)) return $();\n\
        return $(fs.readdirSync(directory)).collect(function(file) {\n\
            return path.join(directory, file);\n\
        });\n\
    };\n\
\n\
    var by_file = function(file) {\n\
        return !by_directory(file);\n\
    };\n\
\n\
    var by_directory = function(file) {\n\
        return fs.statSync(file).isDirectory();\n\
    }\n\
\n\
    var by_pattern = function(filename) {\n\
        return $(patterns).find(function(pattern) {\n\
            return new RegExp(pattern).test(filename)\n\
        })\n\
    };\n\
};\n\
\n\
module.exports = FileSearch;//@ sourceURL=johntron-yadda/lib/FileSearch.js"
));
require.register("johntron-yadda/lib/fn.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = (function() {\n\
\n\
    var slice = Array.prototype.slice;\n\
\n\
    function curry(ctx, fn) {\n\
        var args = slice.call(arguments, 2);\n\
        return function() {\n\
            return fn.apply(ctx, args.concat(slice.call(arguments)));\n\
        }\n\
    };\n\
\n\
    function invoke(fn, ctx, args) {\n\
        return fn.apply(ctx, args);\n\
    };\n\
\n\
    function is_function(object) {\n\
        var getType = {};\n\
        return object && getType.toString.call(object) === '[object Function]';\n\
    };\n\
\n\
    function noop() {};\n\
\n\
    function asynchronize(ctx, fn) {\n\
        return function() {\n\
            var next = slice.call(arguments, arguments.length - 1)[0];\n\
            var args = slice.call(arguments, 0, arguments.length - 2);\n\
            fn.apply(ctx, args);\n\
            if (next) next();\n\
        };\n\
    };\n\
\n\
    return {\n\
        noop: noop,\n\
        async_noop: asynchronize(null, noop), \n\
        asynchronize: asynchronize,\n\
        is_function: is_function,\n\
        curry: curry,\n\
        invoke: invoke\n\
    };\n\
\n\
\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/fn.js"
));
require.register("johntron-yadda/lib/index.js", Function("exports, require, module",
"module.exports = {\n\
    Yadda: require('./Yadda'),\n\
    EventBus: require('./EventBus'),\n\
    Interpreter: require('./Interpreter'),\n\
    Context: require('./Context'),\n\
    Library: require('./Library'),\n\
    Dictionary: require('./Dictionary'),\n\
    FeatureFileSearch: require('./FeatureFileSearch'),    \n\
    FileSearch: require('./FileSearch'),\n\
    localisation: require('./localisation/index'),\n\
    parsers: require('./parsers/index'),\n\
    plugins: require('./plugins/index'),\n\
    shims: require('./shims/index')\n\
};\n\
//@ sourceURL=johntron-yadda/lib/index.js"
));
require.register("johntron-yadda/lib/Interpreter.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Competition = require('./Competition');\n\
var Context = require('./Context');\n\
var EventBus = require('./EventBus');\n\
var $ = require('./Array');\n\
var fn = require('./fn');\n\
\n\
// Understands a scenario\n\
var Interpreter = function(libraries) {\n\
\n\
    var libraries = $(libraries);\n\
    var event_bus = EventBus.instance();\n\
    var _this = this;\n\
\n\
    this.requires = function(libraries) {\n\
        libraries.push_all(libraries);\n\
        return this;\n\
    };\n\
\n\
    this.validate = function(scenario) {\n\
        var results = $(scenario).collect(function(step) {\n\
            return _this.rank_macros(step).validate();\n\
        });\n\
        if (results.find(by_invalid_step)) throw new Error('Scenario cannot be interpreted\\n\
' + results.collect(validation_report).join('\\n\
'));\n\
    };\n\
\n\
    function by_invalid_step(result) {\n\
        return !result.valid;  \n\
    };\n\
\n\
    function validation_report(result) {\n\
        return result.step + (result.valid ? '' : ' <-- ' + result.reason);\n\
    };\n\
\n\
    this.interpret = function(scenario, scenario_context, next) {\n\
        scenario_context = new Context().merge(scenario_context);\n\
        event_bus.send(EventBus.ON_SCENARIO, { scenario: scenario, ctx: scenario_context.properties });\n\
        var iterator = make_step_iterator(scenario_context, next);\n\
        $(scenario).each_async(iterator, next);\n\
    };\n\
\n\
    var make_step_iterator = function(scenario_context, next) {\n\
        var iterator = function(step, index, callback) {\n\
            _this.interpret_step(step, scenario_context, callback);\n\
        };\n\
        return next ? iterator : fn.asynchronize(null, iterator);        \n\
    };\n\
\n\
    this.interpret_step = function(step, scenario_context, next) {\n\
        var context = new Context().merge(scenario_context);\n\
        event_bus.send(EventBus.ON_STEP, { step: step, ctx: context.properties });        \n\
        this.rank_macros(step).clear_winner().interpret(step, context || {}, next);\n\
    };  \n\
\n\
    this.rank_macros = function(step) {\n\
        return new Competition(step, compatible_macros(step));\n\
    };\n\
\n\
    var compatible_macros = function(step) {\n\
        return libraries.inject([], function(macros, library) {\n\
            return macros.concat(library.find_compatible_macros(step));\n\
        });\n\
    };\n\
};\n\
\n\
module.exports = Interpreter;//@ sourceURL=johntron-yadda/lib/Interpreter.js"
));
require.register("johntron-yadda/lib/LevenshteinDistanceScore.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
// Understands similarity of two strings\n\
var LevenshteinDistanceScore = function(s1, s2) {\n\
\n\
    this.value;\n\
    this.type = 'LevenshteinDistanceScore';    \n\
    var distance_table;\n\
    var _this = this;\n\
\n\
    var initialise = function() {\n\
\n\
        var x = s1.length;\n\
        var y = s2.length;\n\
\n\
        distance_table = new Array(x + 1);\n\
\n\
        for (i = 0; i <= x; i++) {\n\
            distance_table[i] = new Array(y + 1);\n\
        }\n\
\n\
        for (var i = 0; i <= x; i++) {\n\
            for (var j = 0; j <= y; j++) {\n\
                distance_table[i][j] = 0;\n\
            }\n\
        }\n\
\n\
        for (var i = 0; i <= x; i++) {\n\
            distance_table[i][0] = i;\n\
        }\n\
\n\
        for (var j = 0; j <= y; j++) {\n\
            distance_table[0][j] = j;\n\
        }\n\
    };\n\
\n\
    var score = function() {\n\
\n\
        if (s1 == s2) return _this.value = 0;\n\
\n\
        for (var j = 0; j < s2.length; j++) {\n\
            for (var i = 0; i < s1.length; i++) {\n\
                if (s1[i] == s2[j]) {\n\
                    distance_table[i+1][j+1] = distance_table[i][j];\n\
                } else {\n\
                    var deletion = distance_table[i][j+1] + 1;\n\
                    var insertion = distance_table[i+1][j] + 1;\n\
                    var substitution = distance_table[i][j] + 1;\n\
                    distance_table[i+1][j+1] = Math.min(substitution, deletion, insertion)\n\
                }\n\
            }\n\
        }\n\
        _this.value = distance_table[s1.length][s2.length];\n\
    };\n\
\n\
    this.beats = function(other) {\n\
        return this.value < other.value;\n\
    } \n\
\n\
    this.equals = function(other) {\n\
        if (!other) return false;\n\
        return (this.type == other.type && this.value == other.value);\n\
    }   \n\
\n\
    initialise();\n\
    score();\n\
};\n\
\n\
module.exports = LevenshteinDistanceScore;//@ sourceURL=johntron-yadda/lib/LevenshteinDistanceScore.js"
));
require.register("johntron-yadda/lib/Library.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Macro = require('./Macro');\n\
var Dictionary = require('./Dictionary');\n\
var $ = require('./Array');\n\
\n\
// Understands how to index macros\n\
var Library = function(dictionary) {\n\
\n\
    var dictionary = dictionary || new Dictionary();\n\
    var macros = $();\n\
    var _this = this;    \n\
\n\
    this.define = function(signatures, fn, macro_context) {\n\
        $(signatures).each(function(signature) {            \n\
            define_macro(signature, fn, macro_context);\n\
        });\n\
        return this;        \n\
    };\n\
\n\
    var define_macro = function(signature, fn, macro_context) {\n\
        if (_this.get_macro(signature)) throw new Error('Duplicate macro: [' + signature + ']');\n\
        macros.push(new Macro(signature, dictionary.expand(signature), fn, macro_context));\n\
    }\n\
\n\
    this.get_macro = function(signature) {      \n\
        return macros.find(function(other_macro) {\n\
            return other_macro.is_identified_by(signature);\n\
        });\n\
    };\n\
\n\
    this.find_compatible_macros = function(step) {\n\
        return macros.find_all(function(macro) {\n\
            return macro.can_interpret(step);\n\
        });\n\
    };\n\
};\n\
\n\
module.exports = Library;//@ sourceURL=johntron-yadda/lib/Library.js"
));
require.register("johntron-yadda/lib/localisation/English.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Language = require('./Language');\n\
\n\
module.exports = (function() {\n\
\n\
    var vocabulary = {\n\
        feature: '[Ff]eature',\n\
        scenario: '[Ss]cenario',\n\
        examples: '(?:[Ee]xamples|[Ww]here)',\n\
        pending: 'Pending',\n\
        given: '(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',\n\
        when: '(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)',\n\
        then: '(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)',\n\
        _steps: ['given', 'when', 'then']\n\
    };\n\
\n\
    return new Language('English', vocabulary);\n\
})();//@ sourceURL=johntron-yadda/lib/localisation/English.js"
));
require.register("johntron-yadda/lib/localisation/French.js", Function("exports, require, module",
"/* -*- coding: utf-8 -*-\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Language = require('./Language');\n\
\n\
module.exports = (function() {\n\
    \n\
    var vocabulary = {\n\
        feature: '(?:[Ff]onctionnalité)',\n\
        scenario: '(?:[Ss]cénario)',\n\
        examples: '(?:[Ee]xemples|[Ee]xemple|[Oo][uù])',\n\
        pending: 'En attente',\n\
        given: '(?:[Ss]oit|[ÉéEe]tant données|[ÉéEe]tant donnée|[ÉéEe]tant donnés|[ÉéEe]tant donné|[Aa]vec|[Ee]t|[Mm]ais|[Aa]ttendre)',\n\
        when: '(?:[Qq]uand|[Ll]orsqu\\'|[Ll]orsque|[Ss]i|[Ee]t|[Mm]ais)',\n\
        then: '(?:[Aa]lors|[Aa]ttendre|[Ee]t|[Mm]ais)',\n\
        \n\
        _steps: [\n\
            'given', 'when', 'then', \n\
            'soit', 'etantdonnees', 'etantdonnee', 'etantdonne',\n\
            'quand', 'lorsque',\n\
            'alors'\n\
        ],\n\
        // Also aliasing French verbs for given-when-then for signature-lookup\n\
        get soit() { return this.given },\n\
        get etantdonnees() { return this.given },\n\
        get etantdonnee() { return this.given },\n\
        get etantdonne() { return this.given },\n\
        get quand() { return this.when },\n\
        get lorsque() { return this.when },\n\
        get alors() { return this.then }\n\
    };\n\
    \n\
    return new Language('French', vocabulary);\n\
})();\n\
\n\
\n\
//@ sourceURL=johntron-yadda/lib/localisation/French.js"
));
require.register("johntron-yadda/lib/localisation/index.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = {\n\
    English: require('./English'),\n\
    Spanish: require('./Spanish'),\n\
    French: require('./French'),\n\
    Norwegian: require('./Norwegian'),\n\
    Pirate: require('./Pirate'),\n\
    Language: require('./Language')\n\
}//@ sourceURL=johntron-yadda/lib/localisation/index.js"
));
require.register("johntron-yadda/lib/localisation/Language.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Library = require('../Library');\n\
var $ = require('../Array');\n\
\n\
module.exports = function(name, vocabulary) {\n\
\n\
    var _this = this;\n\
\n\
    this.library = function(dictionary) {\n\
        return _this.localise_library(new Library(dictionary));\n\
    };\n\
\n\
    this.localise_library = function(library) {\n\
        $(vocabulary._steps).each(function(keyword) {\n\
            library[keyword] = function(signatures, fn, ctx) {\n\
                return $(signatures).each(function(signature) {\n\
                    var signature = prefix_signature(_this.localise(keyword), signature);\n\
                    return library.define(signature, fn, ctx);\n\
                });\n\
            };\n\
        });\n\
        return library;\n\
    };\n\
\n\
    var prefix_signature = function(prefix, signature) {\n\
        var regex_delimiters = new RegExp('^/|/$', 'g');\n\
        var start_of_signature = new RegExp(/^(?:\\^)?/);\n\
        var one_or_more_spaces = '\\\\s+';\n\
        return signature.toString().replace(regex_delimiters, '').replace(start_of_signature, prefix + one_or_more_spaces);\n\
    };\n\
\n\
    this.localise = function(keyword) {\n\
        if (vocabulary[keyword] == undefined) throw new Error('Keyword \"' + keyword + '\" has not been translated into ' + name + '.');\n\
        return vocabulary[keyword];\n\
    };\n\
};//@ sourceURL=johntron-yadda/lib/localisation/Language.js"
));
require.register("johntron-yadda/lib/localisation/Pirate.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Language = require('./Language');\n\
\n\
module.exports = (function() {\n\
\n\
    var vocabulary = {\n\
        feature: '(?:[Tt]ale|[Yy]arn)',\n\
        scenario: '(?:[Aa]dventure|[Ss]ortie)',\n\
        examples: '[Ww]herest',\n\
        pending: 'Brig',\n\
        given: '(?:[Gg]iveth|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)',\n\
        when: '(?:[Ww]hence|[Ii]f|[Aa]nd|[Bb]ut)',\n\
        then: '(?:[Tt]hence|[Ee]xpect|[Aa]nd|[Bb]ut)',\n\
        _steps: ['given', 'when', 'then', 'giveth', 'whence', 'thence'],\n\
        // Also aliasing Pirate verbs for given-when-then for signature-lookup\n\
        get giveth() { return this.given },\n\
        get whence() { return this.when },\n\
        get thence() { return this.then }        \n\
\n\
    };\n\
\n\
    return new Language('Pirate', vocabulary);\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/localisation/Pirate.js"
));
require.register("johntron-yadda/lib/localisation/Spanish.js", Function("exports, require, module",
"/* -*- coding: utf-8 -*-\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Language = require('./Language');\n\
\n\
module.exports = (function() {\n\
    \n\
    var vocabulary = {\n\
        feature: '(?:[Ff]uncionalidad|[Cc]aracterística)',\n\
        scenario: '(?:[Ee]scenario|[Cc]aso)',\n\
        examples: '(?:[Ee]jemplos|[Ee]jemplo)',\n\
        pending: 'Pendiente',\n\
        given: '(?:[Ss]ea|[Ss]ean|[Dd]ado|[Dd]ada|[Dd]ados|[Dd]adas)',\n\
        when: '(?:[Cc]uando|[Ss]i|[Qq]ue)',\n\
        then: '(?:[Ee]ntonces)',\n\
        \n\
        _steps: [\n\
            'given', 'when', 'then', \n\
            'sea', 'sean', 'dado', 'dada','dados', 'dadas',\n\
            'cuando', 'si',\n\
            'entonces'\n\
        ],\n\
\n\
        get sea() { return this.given },\n\
        get sean() { return this.given },\n\
        get dado() { return this.given },\n\
        get dada() { return this.given },\n\
        get dados() { return this.given },\n\
        get dadas() { return this.given },\n\
        get cuando() { return this.when },\n\
        get si() { return this.when },\n\
        get entonces() { return this.then }\n\
    };\n\
    \n\
    return new Language('Spanish', vocabulary);\n\
})();\n\
\n\
\n\
//@ sourceURL=johntron-yadda/lib/localisation/Spanish.js"
));
require.register("johntron-yadda/lib/localisation/Norwegian.js", Function("exports, require, module",
"﻿/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Language = require('./Language');\n\
\n\
module.exports = (function() {\n\
\n\
    var vocabulary = {\n\
        feature: '[Ee]genskap',\n\
        scenario: '[Ss]cenario',\n\
        examples: '[Ee]ksempler',\n\
        pending: 'Avventer',\n\
        given: '(?:[Gg]itt|[Mm]ed|[Oo]g|[Mm]en|[Uu]nntatt)',\n\
        when: '(?:[Nn]år|[Oo]g|[Mm]en)',\n\
        then: '(?:[Ss]å|[Ff]forvent|[Oo]g|[Mm]en)',\n\
        _steps: ['given', 'when', 'then', 'gitt', 'når', 'så'],\n\
        // Also aliasing Norwegian verbs for given-when-then for signature-lookup\n\
        get gitt() { return this.given },\n\
        get når() { return this.when },\n\
        get så() { return this.then }\n\
    };\n\
\n\
    return new Language('Norwegian', vocabulary);\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/localisation/Norwegian.js"
));
require.register("johntron-yadda/lib/Macro.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var fn = require('./fn');\n\
var Context = require('./Context');\n\
var RegularExpression = require('./RegularExpression');\n\
var EventBus = require('./EventBus');\n\
\n\
// Understands how to invoke a step\n\
var Macro = function(signature, signature_pattern, macro, macro_context) {\n\
\n\
    var signature_pattern = new RegularExpression(signature_pattern);\n\
    var macro = macro || fn.async_noop;\n\
    var event_bus = EventBus.instance();\n\
    var _this = this;\n\
\n\
    var init = function(signature, signature_pattern) {\n\
        _this.signature = normalise(signature);\n\
    }\n\
\n\
    this.is_identified_by = function(other_signature) {\n\
        return this.signature == normalise(other_signature);\n\
    };\n\
\n\
    this.can_interpret = function(step) {\n\
        return signature_pattern.test(step);\n\
    };\n\
\n\
    this.interpret = function(step, scenario_context, next) {\n\
        var context = new Context().merge(macro_context).merge(scenario_context);\n\
        var args = signature_pattern.groups(step);\n\
        event_bus.send(EventBus.ON_EXECUTE, { step: step, ctx: context.properties, pattern: signature_pattern.toString(), args: args });\n\
        fn.invoke(macro, context.properties, args.concat(next));\n\
    };\n\
\n\
    this.levenshtein_signature = function() {\n\
        return signature_pattern.without_expressions();\n\
    };\n\
\n\
    var normalise = function(signature) {\n\
        return new RegExp(signature).toString();\n\
    }\n\
\n\
    this.toString = function() {\n\
        return this.signature;\n\
    };\n\
\n\
    init(signature, signature_pattern);\n\
};\n\
\n\
module.exports = Macro;\n\
//@ sourceURL=johntron-yadda/lib/Macro.js"
));
require.register("johntron-yadda/lib/parsers/FeatureParser.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var $ = require('../Array');\n\
var fn = require('../fn');\n\
\n\
var English = require('../localisation/English');\n\
\n\
var FeatureParser = function(language) {\n\
\n\
    var language = language || English;\n\
\n\
    var FEATURE_REGEX = new RegExp('^\\\\s*' + language.localise('feature') + ':\\\\s*(.*)', 'i');\n\
    var SCENARIO_REGEX = new RegExp('^\\\\s*' + language.localise('scenario') + ':\\\\s*(.*)', 'i');\n\
    var EXAMPLES_REGEX = new RegExp('^\\\\s*' + language.localise('examples') + ':', 'i');\n\
    var TEXT_REGEX = new RegExp('^\\\\s*([^\\\\s].*)', 'i');\n\
    var SINGLE_LINE_COMMENT_REGEX = new RegExp('^\\\\s*#');\n\
    var MULTI_LINE_COMMENT_REGEX = new RegExp('^\\\\s*#{3,}')\n\
    var BLANK_REGEX = new RegExp('^\\\\s*$');\n\
    var SIMPLE_ANNOTATION_REGEX = new RegExp('^@([^=]*)$');\n\
    var NVP_ANNOTATION_REGEX = new RegExp('^@([^=]*)=(.*)$');\n\
\n\
    var specification = undefined;\n\
    var comment = undefined;\n\
    var line = undefined;\n\
    var line_number = 0;\n\
\n\
    this.parse = function(text, next) {\n\
        reset();\n\
        split(text).each(parse_line);\n\
        return next && next(specification.export()) || specification.export();\n\
    };\n\
\n\
    function reset() {\n\
        specification = new Specification();\n\
        comment = false;\n\
        line_number = 0;\n\
    };\n\
\n\
    function split(text) {\n\
        return $(text.split(/\\r\\n\
|\\n\
/));\n\
    };\n\
\n\
    function parse_line(line, index) {\n\
        var match;\n\
        try {\n\
            if (match = MULTI_LINE_COMMENT_REGEX.test(line)) return comment = !comment;\n\
            if (match = SINGLE_LINE_COMMENT_REGEX.test(line)) return;        \n\
            if (match = SIMPLE_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: true });\n\
            if (match = NVP_ANNOTATION_REGEX.exec(line)) return specification.handle('Annotation', { key: match[1], value: match[2] });\n\
            if (match = FEATURE_REGEX.exec(line)) return specification.handle('Feature', match[1]);\n\
            if (match = SCENARIO_REGEX.exec(line)) return specification.handle('Scenario', match[1]);\n\
            if (match = EXAMPLES_REGEX.exec(line)) return specification.handle('Examples');\n\
            if (match = BLANK_REGEX.test(line)) return specification.handle('Blank');\n\
            if (match = TEXT_REGEX.exec(line)) return specification.handle('Text', match[1]);\n\
        } catch (e) {\n\
            throw new Error('Error parsing line ' + (index  + 1) + ', \"' + line + '\".\\n\
' + e.message);\n\
        };\n\
    };\n\
}\n\
\n\
var Handlers = function(handlers) {\n\
\n\
    this.register = function(event, handler) {\n\
        handlers[event] = handler;\n\
    };\n\
\n\
    this.unregister = function(event) {\n\
        delete handlers[event];\n\
    };\n\
\n\
    this.find = function(event) {\n\
        if (!handlers[event.toLowerCase()]) throw new Error(event + ' is unexpected at this time');\n\
        return { handle: handlers[event.toLowerCase()] };\n\
    };\n\
};\n\
\n\
var Specification = function() {\n\
\n\
    var current_element = this;\n\
    var feature = undefined;\n\
    var feature_annotations = {};\n\
    var handlers = new Handlers({\n\
        text: fn.noop,\n\
        blank: fn.noop,        \n\
        annotation: stash_annotation,\n\
        feature: start_feature,\n\
        scenario: start_scenario\n\
    });\n\
\n\
    function stash_annotation(event, annotation) {\n\
        feature_annotations[annotation.key] = annotation.value;\n\
        feature_annotations[annotation.key.toLowerCase().replace(/\\W/g, '_')] = annotation.value;\n\
    };\n\
\n\
    function start_feature(event, title) {\n\
        return feature = new Feature(title, feature_annotations);\n\
    };\n\
\n\
    function start_scenario(event, title) {\n\
        start_feature();\n\
        return feature.on(event, title);\n\
    };\n\
\n\
    this.handle = function(event, data) {\n\
        current_element = current_element.on(event, data);\n\
    };\n\
\n\
    this.on = function(event, data) {\n\
        return handlers.find(event).handle(event, data) || this;        \n\
    };\n\
\n\
    this.export = function() {\n\
        if (!feature) throw new Error('A feature must contain one or more scenarios');\n\
        return feature.export();\n\
    };\n\
};\n\
\n\
var Feature = function(title, annotations) {\n\
\n\
    var description = [];\n\
    var scenarios = [];\n\
    var scenario_annotations = {};      \n\
    var handlers = new Handlers({\n\
        text: capture_description,\n\
        blank: end_description,        \n\
        annotation: stash_annotation,        \n\
        scenario: start_scenario\n\
    }); \n\
    var _this = this;\n\
\n\
    function stash_annotation(event, annotation) {\n\
        scenario_annotations[annotation.key] = annotation.value;\n\
        scenario_annotations[annotation.key.toLowerCase().replace(/\\W/g, '_')] = annotation.value;\n\
    };\n\
\n\
    function capture_description(event, text) {\n\
        description.push(text);\n\
    };\n\
\n\
    function end_description() {\n\
        handlers.unregister('text');\n\
        handlers.register('blank', fn.noop);\n\
    };\n\
\n\
    function start_scenario(event, title) {\n\
        var scenario = new Scenario(title, scenario_annotations, _this);\n\
        scenarios.push(scenario);\n\
        scenario_annotations = {};        \n\
        return scenario;\n\
    };\n\
\n\
    this.on = function(event, data) {\n\
        return handlers.find(event).handle(event, data) || this;\n\
    };\n\
\n\
    this.export = function() {\n\
        return {\n\
            title: title,\n\
            annotations: annotations,\n\
            description: description,\n\
            scenarios: $(scenarios).collect(function(scenario) {\n\
                return scenario.export();\n\
            }).flatten().naked()\n\
        };        \n\
    };\n\
};\n\
\n\
var Scenario = function(title, annotations, feature) {\n\
\n\
    var description = [];\n\
    var steps = [];\n\
    var examples = undefined;\n\
    var handlers = new Handlers({\n\
        text: capture_description,        \n\
        blank: end_description,\n\
        annotation: start_scenario,\n\
        scenario: start_scenario,\n\
        examples: start_examples\n\
    }); \n\
    var _this = this;  \n\
\n\
    function capture_description(event, text) {\n\
        description.push(text);\n\
    };\n\
\n\
    function end_description() {\n\
        handlers.register('text', capture_step);\n\
        handlers.register('blank', fn.noop);\n\
    };\n\
\n\
    function capture_step(event, text) {\n\
        steps.push(text);\n\
    }\n\
\n\
    function start_scenario(event, data) {\n\
        validate();\n\
        return feature.on(event, data);\n\
    };  \n\
\n\
    function start_examples(event, data) {\n\
        validate();\n\
        return examples = new Examples(_this);\n\
    };\n\
\n\
    function validate() {\n\
        if (steps.length == 0) throw new Error('Scenario requires one or more steps');        \n\
    };\n\
\n\
    this.on = function(event, data) {\n\
        return handlers.find(event).handle(event, data) || this;\n\
    };\n\
\n\
    this.export = function() {\n\
        validate();\n\
        var result = {\n\
            title: title,\n\
            annotations: annotations,\n\
            description: description,\n\
            steps: steps\n\
        };\n\
        return examples ? examples.expand(result) : result;\n\
    };\n\
};\n\
\n\
var Examples = function(scenario) {\n\
\n\
    var SURROUNDING_WHITESPACE_REGEX = /^\\s+|\\s+$/g;\n\
\n\
    var headings = [];\n\
    var examples = $();\n\
    var handlers = new Handlers({\n\
        text: capture_headings,        \n\
        blank: fn.noop,\n\
        annotation: start_scenario,\n\
        scenario: start_scenario,\n\
    });\n\
\n\
    function capture_headings(event, data) {\n\
        handlers.register('text', capture_example);\n\
        headings = split(data).collect(function(column) {\n\
            return column.replace(SURROUNDING_WHITESPACE_REGEX, '');\n\
        }).naked();\n\
    };\n\
\n\
    function capture_example(event, data) {\n\
        var fields = split(data, headings.length);\n\
        var example = {};\n\
        fields.each(function(field, index) {\n\
            example[headings[index]] = field.replace(SURROUNDING_WHITESPACE_REGEX, '');            \n\
        });\n\
        examples.push(example);\n\
    };\n\
\n\
    function split(row, number_of_fields) {\n\
        var fields = $(row.split('|'));\n\
        if (number_of_fields != undefined && number_of_fields != fields.length) {\n\
            throw new Error('Incorrect number of fields in example table. Expected ' + number_of_fields + ' but found ' + fields.length);                    \n\
        }\n\
        return fields;\n\
    };\n\
\n\
    function start_scenario(event, data) {\n\
        validate();\n\
        return scenario.on(event, data);\n\
    };\n\
\n\
    function validate() {\n\
        if (headings.length == 0) throw new Error('Examples table requires one or more headings');\n\
        if (examples.length == 0) throw new Error('Examples table requires one or more rows');        \n\
    };\n\
\n\
    this.on = function(event, data) {\n\
        return handlers.find(event).handle(event, data) || this;\n\
    };\n\
\n\
    this.expand = function(scenario) {\n\
        validate();\n\
        return examples.collect(function(example) {\n\
            return {\n\
                title: substitute(example, scenario.title),\n\
                annotations: scenario.annotations,\n\
                description: substitute(example, scenario.description),\n\
                steps: substitute(example, scenario.steps)\n\
            };            \n\
        }).naked();\n\
    };\n\
\n\
    function substitute(example, lines) {\n\
        return $(lines).collect(function(line) {\n\
            for (var heading in example) {\n\
                line = line.replace(new RegExp('\\\\[\\\\s*' + heading + '\\\\s*\\\\]', 'g'), example[heading]);\n\
            };\n\
            return line;\n\
        }).naked();\n\
    }\n\
};\n\
\n\
module.exports = FeatureParser;//@ sourceURL=johntron-yadda/lib/parsers/FeatureParser.js"
));
require.register("johntron-yadda/lib/parsers/index.js", Function("exports, require, module",
"module.exports = {\n\
    StepParser: require('./StepParser'),\n\
    FeatureParser: require('./FeatureParser')\n\
}//@ sourceURL=johntron-yadda/lib/parsers/index.js"
));
require.register("johntron-yadda/lib/parsers/StepParser.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
\n\
var $ = require('../Array');\n\
\n\
var StepParser = function() {\n\
\n\
    var NON_BLANK_REGEX = /[^\\s]/;\n\
\n\
    this.parse = function(text, next) {\n\
        var steps = split(text).find_all(non_blanks);\n\
        return next && next(steps) || steps;\n\
    };\n\
\n\
    var split = function(text) {\n\
        return $(text.split(/\\n\
/));\n\
    };\n\
\n\
    var non_blanks = function(text) {\n\
        return text && NON_BLANK_REGEX.test(text);\n\
    };\n\
};\n\
\n\
module.exports = StepParser;//@ sourceURL=johntron-yadda/lib/parsers/StepParser.js"
));
require.register("johntron-yadda/lib/plugins/CasperPlugin.js", Function("exports, require, module",
"if (!module.client) {   \n\
    var fs = require('fs');\n\
    global.process = global.process || {\n\
        cwd: function() {\n\
            return fs.workingDirectory\n\
        }\n\
    };\n\
}\n\
\n\
\n\
module.exports = function(yadda, casper) {\n\
\n\
    var EventBus = require('yadda').EventBus;\n\
\n\
    yadda.interpreter.interpret_step = function(step, ctx, next) {\n\
\n\
        var _this = this;\n\
        casper.then(function() {\n\
            casper.test.info(step);\n\
            EventBus.instance().send(EventBus.ON_STEP, { step: step, ctx: ctx });\n\
            _this.rank_macros(step).clear_winner().interpret(step, ctx, next);\n\
        });\n\
    };\n\
\n\
    casper.yadda = function(script, ctx) {\n\
        if (script == undefined) return this;\n\
        yadda.yadda(script, ctx);\n\
    }\n\
};\n\
//@ sourceURL=johntron-yadda/lib/plugins/CasperPlugin.js"
));
require.register("johntron-yadda/lib/plugins/index.js", Function("exports, require, module",
"module.exports = {\n\
    casper: require('./CasperPlugin'),\n\
    mocha: require('./MochaPlugin'),\n\
    jasmine: require('./MochaPlugin')\n\
}//@ sourceURL=johntron-yadda/lib/plugins/index.js"
));
require.register("johntron-yadda/lib/plugins/MochaPlugin.js", Function("exports, require, module",
"if (!module.client) {\n\
\tvar fs = require('fs');\n\
}\n\
var English = require('../localisation/English');\n\
var FeatureParser = require('../parsers/FeatureParser');\n\
var $ = require('../Array');\n\
\n\
module.exports = function(options) {\n\
\n\
    var options = options || {};\n\
    var language = options.language || English;\n\
    var parser = options.parser || new FeatureParser(language);\n\
    var mode = options.mode || 'async';\n\
\tif (module.client) {\n\
\t\tvar feature = function (text, next) {\n\
\t\t\tparser.parse(text, function(feature) {\n\
\t\t\t\tvar _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;\n\
\t\t\t\t_describe(feature.title || filename, function() {\n\
\t\t\t\t\tnext(feature)\n\
\t\t\t\t});\n\
\t\t\t});\n\
\t\t};\n\
\t} else {\n\
\t\tvar feature = function (filenames, next) {\n\
\t\t\t$(filenames).each(function(filename) {\n\
\t\t\t\tvar text = fs.readFileSync(filename, 'utf8');\n\
\t\t\t\tparser.parse(text, function(feature) {\n\
\t\t\t\t\tvar _describe = feature.annotations[language.localise('pending')] ? xdescribe : describe;\n\
\t\t\t\t\t_describe(feature.title || filename, function() {\n\
\t\t\t\t\t\tnext(feature)\n\
\t\t\t\t\t});\n\
\t\t\t\t});\n\
\t\t\t});\n\
\t\t};\n\
\t}\n\
\n\
    function async_scenarios(scenarios, next) {\n\
        $(scenarios).each(function(scenario) {\n\
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;\n\
            _it(scenario.title, function(done) {\n\
                next(scenario, done)\n\
            });\n\
        });\n\
    };\n\
\n\
    function sync_scenarios(scenarios, next) {\n\
        $(scenarios).each(function(scenario) {\n\
            var _it = scenario.annotations[language.localise('pending')] ? xit : it;\n\
            _it(scenario.title, function() {\n\
                next(scenario)\n\
            });\n\
        });\n\
    };\n\
\n\
\tif (typeof GLOBAL !== 'undefined') {\n\
\t\tGLOBAL.features = GLOBAL.feature = feature;\n\
\t\tGLOBAL.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;\n\
\t}\n\
\n\
\tif (typeof window !== 'undefined') {\n\
\t\twindow.features = window.feature = feature;\n\
\t\twindow.scenarios = mode == 'async' ? async_scenarios : sync_scenarios;\n\
\t}\n\
};\n\
//@ sourceURL=johntron-yadda/lib/plugins/MochaPlugin.js"
));
require.register("johntron-yadda/lib/RegularExpression.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
 \n\
var $ = require('./Array');\n\
\n\
// Wrapper for JavaScript Regular Expressions\n\
var RegularExpression = function(pattern_or_regexp) {\n\
\n\
    var groups_pattern = /(^|[^\\\\\\\\])\\(.*?\\)/g;\n\
    var sets_pattern = /(^|[^\\\\\\\\])\\[.*?\\]/g;\n\
    var repetitions_pattern = /(^|[^\\\\\\\\])\\{.*?\\}/g;\n\
    var regex_aliases_pattern = /(^|[^\\\\\\\\])\\\\./g;\n\
    var non_word_tokens_pattern = /[^\\w\\s]/g;\n\
    var regexp = new RegExp(pattern_or_regexp);\n\
\n\
    this.test = function(text) {\n\
        var result = regexp.test(text);\n\
        this.reset();        \n\
        return result;\n\
    };  \n\
\n\
    this.groups = function(text) {\n\
        var results = $();\n\
        var match = regexp.exec(text);\n\
        while (match) {            \n\
            var groups = match.slice(1, match.length);\n\
            results.push(groups)\n\
            match = regexp.global && regexp.exec(text)\n\
        }\n\
        this.reset();\n\
        return results.flatten();        \n\
    };   \n\
\n\
    this.reset = function() {\n\
        regexp.lastIndex = 0;\n\
        return this;\n\
    };\n\
\n\
    this.without_expressions = function() {\n\
        return regexp.source.replace(groups_pattern, '$1')\n\
                            .replace(sets_pattern, '$1')\n\
                            .replace(repetitions_pattern, '$1')\n\
                            .replace(regex_aliases_pattern, '$1')\n\
                            .replace(non_word_tokens_pattern, '');\n\
    };    \n\
\n\
    this.equals = function(other) {\n\
        return this.toString() == other.toString();\n\
    };    \n\
\n\
    this.toString = function() {\n\
        return \"/\" + regexp.source + \"/\";\n\
    };\n\
};\n\
\n\
module.exports = RegularExpression;//@ sourceURL=johntron-yadda/lib/RegularExpression.js"
));
require.register("johntron-yadda/lib/shims/index.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = (function() {\n\
\n\
    var shims = {\n\
        node: function() {\n\
            return {\n\
                fs: require('fs'),\n\
                path: require('path'),\n\
                process: process\n\
            }\n\
        },\n\
        phantom: function() {\n\
            return {\n\
                fs: require('./phantom-fs'),\n\
                path: require('./phantom-path'),\n\
                process: require('./phantom-process')\n\
            }\n\
        }\n\
    }\n\
\n\
    function is_node() {\n\
        return typeof global != 'undefined' &&\n\
               typeof global.process != 'undefined' &&\n\
               global.process.title == 'node';\n\
    }\n\
\n\
    function is_phantom() {\n\
        return typeof phantom;\n\
    }\n\
\n\
    function get_shim() {\n\
        if (is_node()) return shims.node();\n\
\n\
        if (is_phantom()) return shims.phantom();\n\
        throw new Error('Unsupported Platform');\n\
    }\n\
\n\
    return get_shim();\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/shims/index.js"
));
require.register("johntron-yadda/lib/shims/phantom-fs.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = (function() {\n\
    if (module.client) {\n\
        // Running in browser, not via node\n\
        return {}; // short-circuit;\n\
    }\n\
\n\
    var fs = require('fs');\n\
\n\
    fs.existsSync = fs.existsSync || fs.exists;\n\
\n\
    fs.readdirSync = fs.readdirSync || function(path) {\n\
        return fs.list(path).filter(function(name) {\n\
            return name != '.' && name != '..';\n\
        });\n\
    };\n\
\n\
    fs.statSync = fs.statSync || function(path) {\n\
        return {\n\
            isDirectory: function() {\n\
                return fs.isDirectory(path);\n\
            }\n\
        }\n\
    };\n\
\n\
    return fs;\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/shims/phantom-fs.js"
));
require.register("johntron-yadda/lib/shims/phantom-path.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = (function() {\n\
    if (module.client) {\n\
        // Running in browser, not via node\n\
        return {}; // short-circuit;\n\
    }\n\
\n\
    var fs = require('fs');\n\
    var path = {};\n\
\n\
    try {\n\
        path = require('path');\n\
    } catch (e) {\n\
        // meh\n\
    };\n\
\n\
    path.join = path.join || function() {\n\
        return Array.prototype.join.call(arguments, fs.separator);\n\
    };\n\
\n\
    path.relative = path.relative || function(from, to) {\n\
        return from + fs.separator + to;\n\
    };\n\
\n\
    return path;\n\
\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/shims/phantom-path.js"
));
require.register("johntron-yadda/lib/shims/phantom-process.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
module.exports = (function() {\n\
    if (module.client) {\n\
        // Running in browser, not via node\n\
        return {}; // short-circuit;\n\
    }\n\
\n\
    var fs = require('fs');\n\
    var process = typeof process != 'undefined' ? process : {};\n\
\n\
    process.cwd = function() {\n\
        return fs.workingDirectory;\n\
    };\n\
\n\
    return process;\n\
\n\
})();\n\
//@ sourceURL=johntron-yadda/lib/shims/phantom-process.js"
));
require.register("johntron-yadda/lib/Yadda.js", Function("exports, require, module",
"/*\n\
 * Copyright 2010 Acuminous Ltd / Energized Work Ltd\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 *     http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 */\n\
\n\
var Interpreter = require('./Interpreter');\n\
var Context = require('./Context');\n\
var fn = require('./fn');\n\
\n\
// Provides a repetitive interface, i.e. new Yadda().yadda().yadda() to the Yadda Interpreter\n\
var Yadda = function(libraries, interpreter_context) {\n\
\n\
    this.interpreter = new Interpreter(libraries);\n\
    var _this = this;\n\
\n\
    this.requires = function(libraries) {\n\
        this.interpreter.requires(libraries);\n\
        return this;\n\
    };\n\
\n\
    this.yadda = function(scenario, scenario_context, next) {\n\
        if (arguments.length == 0) return this;\n\
        if (arguments.length == 2 && fn.is_function(scenario_context)) return this.yadda(scenario, {}, scenario_context);\n\
        this.interpreter.validate(scenario);\n\
        this.interpreter.interpret(scenario, new Context().merge(interpreter_context).merge(scenario_context), next);\n\
    };\n\
\n\
    this.toString = function() {\n\
        return \"Yadda 0.9.7 Copyright 2010 Acuminous Ltd / Energized Work Ltd\";\n\
    };\n\
};\n\
\n\
module.exports = Yadda;\n\
//@ sourceURL=johntron-yadda/lib/Yadda.js"
));
require.register("chaijs-assertion-error/index.js", Function("exports, require, module",
"/*!\n\
 * assertion-error\n\
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Return a function that will copy properties from\n\
 * one object to another excluding any originally\n\
 * listed. Returned function will create a new `{}`.\n\
 *\n\
 * @param {String} excluded properties ...\n\
 * @return {Function}\n\
 */\n\
\n\
function exclude () {\n\
  var excludes = [].slice.call(arguments);\n\
\n\
  function excludeProps (res, obj) {\n\
    Object.keys(obj).forEach(function (key) {\n\
      if (!~excludes.indexOf(key)) res[key] = obj[key];\n\
    });\n\
  }\n\
\n\
  return function extendExclude () {\n\
    var args = [].slice.call(arguments)\n\
      , i = 0\n\
      , res = {};\n\
\n\
    for (; i < args.length; i++) {\n\
      excludeProps(res, args[i]);\n\
    }\n\
\n\
    return res;\n\
  };\n\
};\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
module.exports = AssertionError;\n\
\n\
/**\n\
 * ### AssertionError\n\
 *\n\
 * An extension of the JavaScript `Error` constructor for\n\
 * assertion and validation scenarios.\n\
 *\n\
 * @param {String} message\n\
 * @param {Object} properties to include (optional)\n\
 * @param {callee} start stack function (optional)\n\
 */\n\
\n\
function AssertionError (message, _props, ssf) {\n\
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')\n\
    , props = extend(_props || {});\n\
\n\
  // default values\n\
  this.message = message || 'Unspecified AssertionError';\n\
  this.showDiff = false;\n\
\n\
  // copy from properties\n\
  for (var key in props) {\n\
    this[key] = props[key];\n\
  }\n\
\n\
  // capture stack trace\n\
  ssf = ssf || arguments.callee;\n\
  if (ssf && Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, ssf);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Inherit from Error.prototype\n\
 */\n\
\n\
AssertionError.prototype = Object.create(Error.prototype);\n\
\n\
/*!\n\
 * Statically set name\n\
 */\n\
\n\
AssertionError.prototype.name = 'AssertionError';\n\
\n\
/*!\n\
 * Ensure correct constructor\n\
 */\n\
\n\
AssertionError.prototype.constructor = AssertionError;\n\
\n\
/**\n\
 * Allow errors to be converted to JSON for static transfer.\n\
 *\n\
 * @param {Boolean} include stack (default: `true`)\n\
 * @return {Object} object that can be `JSON.stringify`\n\
 */\n\
\n\
AssertionError.prototype.toJSON = function (stack) {\n\
  var extend = exclude('constructor', 'toJSON', 'stack')\n\
    , props = extend({ name: this.name }, this);\n\
\n\
  // include stack if exists and not turned off\n\
  if (false !== stack && this.stack) {\n\
    props.stack = this.stack;\n\
  }\n\
\n\
  return props;\n\
};\n\
//@ sourceURL=chaijs-assertion-error/index.js"
));
require.register("chaijs-type-detect/lib/type.js", Function("exports, require, module",
"/*!\n\
 * type-detect\n\
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
var exports = module.exports = getType;\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Array]': 'array'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object Function]': 'function'\n\
  , '[object Arguments]': 'arguments'\n\
  , '[object Date]': 'date'\n\
};\n\
\n\
/**\n\
 * ### typeOf (obj)\n\
 *\n\
 * Use several different techniques to determine\n\
 * the type of object being tested.\n\
 *\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {String} object type\n\
 * @api public\n\
 */\n\
\n\
function getType (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
}\n\
\n\
exports.Library = Library;\n\
\n\
/**\n\
 * ### Library\n\
 *\n\
 * Create a repository for custom type detection.\n\
 *\n\
 * ```js\n\
 * var lib = new type.Library;\n\
 * ```\n\
 *\n\
 */\n\
\n\
function Library () {\n\
  this.tests = {};\n\
}\n\
\n\
/**\n\
 * #### .of (obj)\n\
 *\n\
 * Expose replacement `typeof` detection to the library.\n\
 *\n\
 * ```js\n\
 * if ('string' === lib.of('hello world')) {\n\
 *   // ...\n\
 * }\n\
 * ```\n\
 *\n\
 * @param {Mixed} object to test\n\
 * @return {String} type\n\
 */\n\
\n\
Library.prototype.of = getType;\n\
\n\
/**\n\
 * #### .define (type, test)\n\
 *\n\
 * Add a test to for the `.test()` assertion.\n\
 *\n\
 * Can be defined as a regular expression:\n\
 *\n\
 * ```js\n\
 * lib.define('int', /^[0-9]+$/);\n\
 * ```\n\
 *\n\
 * ... or as a function:\n\
 *\n\
 * ```js\n\
 * lib.define('bln', function (obj) {\n\
 *   if ('boolean' === lib.of(obj)) return true;\n\
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];\n\
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();\n\
 *   return !! ~blns.indexOf(obj);\n\
 * });\n\
 * ```\n\
 *\n\
 * @param {String} type\n\
 * @param {RegExp|Function} test\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.define = function (type, test) {\n\
  if (arguments.length === 1) return this.tests[type];\n\
  this.tests[type] = test;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * #### .test (obj, test)\n\
 *\n\
 * Assert that an object is of type. Will first\n\
 * check natives, and if that does not pass it will\n\
 * use the user defined custom tests.\n\
 *\n\
 * ```js\n\
 * assert(lib.test('1', 'int'));\n\
 * assert(lib.test('yes', 'bln'));\n\
 * ```\n\
 *\n\
 * @param {Mixed} object\n\
 * @param {String} type\n\
 * @return {Boolean} result\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.test = function (obj, type) {\n\
  if (type === getType(obj)) return true;\n\
  var test = this.tests[type];\n\
\n\
  if (test && 'regexp' === getType(test)) {\n\
    return test.test(obj);\n\
  } else if (test && 'function' === getType(test)) {\n\
    return test(obj);\n\
  } else {\n\
    throw new ReferenceError('Type test \"' + type + '\" not defined or invalid.');\n\
  }\n\
};\n\
//@ sourceURL=chaijs-type-detect/lib/type.js"
));
require.register("chaijs-deep-eql/lib/eql.js", Function("exports, require, module",
"/*!\n\
 * deep-eql\n\
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var type = require('type-detect');\n\
\n\
/*!\n\
 * Buffer.isBuffer browser shim\n\
 */\n\
\n\
var Buffer;\n\
try { Buffer = require('buffer').Buffer; }\n\
catch(ex) {\n\
  Buffer = {};\n\
  Buffer.isBuffer = function() { return false; }\n\
}\n\
\n\
/*!\n\
 * Primary Export\n\
 */\n\
\n\
module.exports = deepEqual;\n\
\n\
/**\n\
 * Assert super-strict (egal) equality between\n\
 * two objects of any type.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @param {Array} memoised (optional)\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function deepEqual(a, b, m) {\n\
  if (sameValue(a, b)) {\n\
    return true;\n\
  } else if ('date' === type(a)) {\n\
    return dateEqual(a, b);\n\
  } else if ('regexp' === type(a)) {\n\
    return regexpEqual(a, b);\n\
  } else if (Buffer.isBuffer(a)) {\n\
    return bufferEqual(a, b);\n\
  } else if ('arguments' === type(a)) {\n\
    return argumentsEqual(a, b, m);\n\
  } else if (!typeEqual(a, b)) {\n\
    return false;\n\
  } else if (('object' !== type(a) && 'object' !== type(b))\n\
  && ('array' !== type(a) && 'array' !== type(b))) {\n\
    return sameValue(a, b);\n\
  } else {\n\
    return objectEqual(a, b, m);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Strict (egal) equality test. Ensures that NaN always\n\
 * equals NaN and `-0` does not equal `+0`.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function sameValue(a, b) {\n\
  if (a === b) return a !== 0 || 1 / a === 1 / b;\n\
  return a !== a && b !== b;\n\
}\n\
\n\
/*!\n\
 * Compare the types of two given objects and\n\
 * return if they are equal. Note that an Array\n\
 * has a type of `array` (not `object`) and arguments\n\
 * have a type of `arguments` (not `array`/`object`).\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function typeEqual(a, b) {\n\
  return type(a) === type(b);\n\
}\n\
\n\
/*!\n\
 * Compare two Date objects by asserting that\n\
 * the time values are equal using `saveValue`.\n\
 *\n\
 * @param {Date} a\n\
 * @param {Date} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function dateEqual(a, b) {\n\
  if ('date' !== type(b)) return false;\n\
  return sameValue(a.getTime(), b.getTime());\n\
}\n\
\n\
/*!\n\
 * Compare two regular expressions by converting them\n\
 * to string and checking for `sameValue`.\n\
 *\n\
 * @param {RegExp} a\n\
 * @param {RegExp} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function regexpEqual(a, b) {\n\
  if ('regexp' !== type(b)) return false;\n\
  return sameValue(a.toString(), b.toString());\n\
}\n\
\n\
/*!\n\
 * Assert deep equality of two `arguments` objects.\n\
 * Unfortunately, these must be sliced to arrays\n\
 * prior to test to ensure no bad behavior.\n\
 *\n\
 * @param {Arguments} a\n\
 * @param {Arguments} b\n\
 * @param {Array} memoize (optional)\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function argumentsEqual(a, b, m) {\n\
  if ('arguments' !== type(b)) return false;\n\
  a = [].slice.call(a);\n\
  b = [].slice.call(b);\n\
  return deepEqual(a, b, m);\n\
}\n\
\n\
/*!\n\
 * Get enumerable properties of a given object.\n\
 *\n\
 * @param {Object} a\n\
 * @return {Array} property names\n\
 */\n\
\n\
function enumerable(a) {\n\
  var res = [];\n\
  for (var key in a) res.push(key);\n\
  return res;\n\
}\n\
\n\
/*!\n\
 * Simple equality for flat iterable objects\n\
 * such as Arrays or Node.js buffers.\n\
 *\n\
 * @param {Iterable} a\n\
 * @param {Iterable} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function iterableEqual(a, b) {\n\
  if (a.length !==  b.length) return false;\n\
\n\
  var i = 0;\n\
  var match = true;\n\
\n\
  for (; i < a.length; i++) {\n\
    if (a[i] !== b[i]) {\n\
      match = false;\n\
      break;\n\
    }\n\
  }\n\
\n\
  return match;\n\
}\n\
\n\
/*!\n\
 * Extension to `iterableEqual` specifically\n\
 * for Node.js Buffers.\n\
 *\n\
 * @param {Buffer} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function bufferEqual(a, b) {\n\
  if (!Buffer.isBuffer(b)) return false;\n\
  return iterableEqual(a, b);\n\
}\n\
\n\
/*!\n\
 * Block for `objectEqual` ensuring non-existing\n\
 * values don't get in.\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function isValue(a) {\n\
  return a !== null && a !== undefined;\n\
}\n\
\n\
/*!\n\
 * Recursively check the equality of two objects.\n\
 * Once basic sameness has been established it will\n\
 * defer to `deepEqual` for each enumerable key\n\
 * in the object.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function objectEqual(a, b, m) {\n\
  if (!isValue(a) || !isValue(b)) {\n\
    return false;\n\
  }\n\
\n\
  if (a.prototype !== b.prototype) {\n\
    return false;\n\
  }\n\
\n\
  var i;\n\
  if (m) {\n\
    for (i = 0; i < m.length; i++) {\n\
      if ((m[i][0] === a && m[i][1] === b)\n\
      ||  (m[i][0] === b && m[i][1] === a)) {\n\
        return true;\n\
      }\n\
    }\n\
  } else {\n\
    m = [];\n\
  }\n\
\n\
  try {\n\
    var ka = enumerable(a);\n\
    var kb = enumerable(b);\n\
  } catch (ex) {\n\
    return false;\n\
  }\n\
\n\
  ka.sort();\n\
  kb.sort();\n\
\n\
  if (!iterableEqual(ka, kb)) {\n\
    return false;\n\
  }\n\
\n\
  m.push([ a, b ]);\n\
\n\
  var key;\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!deepEqual(a[key], b[key], m)) {\n\
      return false;\n\
    }\n\
  }\n\
\n\
  return true;\n\
}\n\
//@ sourceURL=chaijs-deep-eql/lib/eql.js"
));
require.register("chaijs-chai/index.js", Function("exports, require, module",
"module.exports = require('./lib/chai');\n\
//@ sourceURL=chaijs-chai/index.js"
));
require.register("chaijs-chai/lib/chai.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var used = []\n\
  , exports = module.exports = {};\n\
\n\
/*!\n\
 * Chai version\n\
 */\n\
\n\
exports.version = '1.8.1';\n\
\n\
/*!\n\
 * Assertion Error\n\
 */\n\
\n\
exports.AssertionError = require('assertion-error');\n\
\n\
/*!\n\
 * Utils for plugins (not exported)\n\
 */\n\
\n\
var util = require('./chai/utils');\n\
\n\
/**\n\
 * # .use(function)\n\
 *\n\
 * Provides a way to extend the internals of Chai\n\
 *\n\
 * @param {Function}\n\
 * @returns {this} for chaining\n\
 * @api public\n\
 */\n\
\n\
exports.use = function (fn) {\n\
  if (!~used.indexOf(fn)) {\n\
    fn(this, util);\n\
    used.push(fn);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/*!\n\
 * Primary `Assertion` prototype\n\
 */\n\
\n\
var assertion = require('./chai/assertion');\n\
exports.use(assertion);\n\
\n\
/*!\n\
 * Core Assertions\n\
 */\n\
\n\
var core = require('./chai/core/assertions');\n\
exports.use(core);\n\
\n\
/*!\n\
 * Expect interface\n\
 */\n\
\n\
var expect = require('./chai/interface/expect');\n\
exports.use(expect);\n\
\n\
/*!\n\
 * Should interface\n\
 */\n\
\n\
var should = require('./chai/interface/should');\n\
exports.use(should);\n\
\n\
/*!\n\
 * Assert interface\n\
 */\n\
\n\
var assert = require('./chai/interface/assert');\n\
exports.use(assert);\n\
//@ sourceURL=chaijs-chai/lib/chai.js"
));
require.register("chaijs-chai/lib/chai/assertion.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (_chai, util) {\n\
  /*!\n\
   * Module dependencies.\n\
   */\n\
\n\
  var AssertionError = _chai.AssertionError\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  _chai.Assertion = Assertion;\n\
\n\
  /*!\n\
   * Assertion Constructor\n\
   *\n\
   * Creates object for chaining.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  function Assertion (obj, msg, stack) {\n\
    flag(this, 'ssfi', stack || arguments.callee);\n\
    flag(this, 'object', obj);\n\
    flag(this, 'message', msg);\n\
  }\n\
\n\
  /*!\n\
    * ### Assertion.includeStack\n\
    *\n\
    * User configurable property, influences whether stack trace\n\
    * is included in Assertion error message. Default of false\n\
    * suppresses stack trace in the error message\n\
    *\n\
    *     Assertion.includeStack = true;  // enable stack on error\n\
    *\n\
    * @api public\n\
    */\n\
\n\
  Assertion.includeStack = false;\n\
\n\
  /*!\n\
   * ### Assertion.showDiff\n\
   *\n\
   * User configurable property, influences whether or not\n\
   * the `showDiff` flag should be included in the thrown\n\
   * AssertionErrors. `false` will always be `false`; `true`\n\
   * will be true when the assertion has requested a diff\n\
   * be shown.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.showDiff = true;\n\
\n\
  Assertion.addProperty = function (name, fn) {\n\
    util.addProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addMethod = function (name, fn) {\n\
    util.addMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  Assertion.overwriteProperty = function (name, fn) {\n\
    util.overwriteProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteMethod = function (name, fn) {\n\
    util.overwriteMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.overwriteChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  /*!\n\
   * ### .assert(expression, message, negateMessage, expected, actual)\n\
   *\n\
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.\n\
   *\n\
   * @name assert\n\
   * @param {Philosophical} expression to be tested\n\
   * @param {String} message to display if fails\n\
   * @param {String} negatedMessage to display if negated expression fails\n\
   * @param {Mixed} expected value (remember to check for negation)\n\
   * @param {Mixed} actual (optional) will default to `this.obj`\n\
   * @api private\n\
   */\n\
\n\
  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {\n\
    var ok = util.test(this, arguments);\n\
    if (true !== showDiff) showDiff = false;\n\
    if (true !== Assertion.showDiff) showDiff = false;\n\
\n\
    if (!ok) {\n\
      var msg = util.getMessage(this, arguments)\n\
        , actual = util.getActual(this, arguments);\n\
      throw new AssertionError(msg, {\n\
          actual: actual\n\
        , expected: expected\n\
        , showDiff: showDiff\n\
      }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));\n\
    }\n\
  };\n\
\n\
  /*!\n\
   * ### ._obj\n\
   *\n\
   * Quick reference to stored `actual` value for plugin developers.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Object.defineProperty(Assertion.prototype, '_obj',\n\
    { get: function () {\n\
        return flag(this, 'object');\n\
      }\n\
    , set: function (val) {\n\
        flag(this, 'object', val);\n\
      }\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/assertion.js"
));
require.register("chaijs-chai/lib/chai/core/assertions.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, _) {\n\
  var Assertion = chai.Assertion\n\
    , toString = Object.prototype.toString\n\
    , flag = _.flag;\n\
\n\
  /**\n\
   * ### Language Chains\n\
   *\n\
   * The following are provide as chainable getters to\n\
   * improve the readability of your assertions. They\n\
   * do not provide an testing capability unless they\n\
   * have been overwritten by a plugin.\n\
   *\n\
   * **Chains**\n\
   *\n\
   * - to\n\
   * - be\n\
   * - been\n\
   * - is\n\
   * - that\n\
   * - and\n\
   * - have\n\
   * - with\n\
   * - at\n\
   * - of\n\
   * - same\n\
   *\n\
   * @name language chains\n\
   * @api public\n\
   */\n\
\n\
  [ 'to', 'be', 'been'\n\
  , 'is', 'and', 'have'\n\
  , 'with', 'that', 'at'\n\
  , 'of', 'same' ].forEach(function (chain) {\n\
    Assertion.addProperty(chain, function () {\n\
      return this;\n\
    });\n\
  });\n\
\n\
  /**\n\
   * ### .not\n\
   *\n\
   * Negates any of assertions following in the chain.\n\
   *\n\
   *     expect(foo).to.not.equal('bar');\n\
   *     expect(goodFn).to.not.throw(Error);\n\
   *     expect({ foo: 'baz' }).to.have.property('foo')\n\
   *       .and.not.equal('bar');\n\
   *\n\
   * @name not\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('not', function () {\n\
    flag(this, 'negate', true);\n\
  });\n\
\n\
  /**\n\
   * ### .deep\n\
   *\n\
   * Sets the `deep` flag, later used by the `equal` and\n\
   * `property` assertions.\n\
   *\n\
   *     expect(foo).to.deep.equal({ bar: 'baz' });\n\
   *     expect({ foo: { bar: { baz: 'quux' } } })\n\
   *       .to.have.deep.property('foo.bar.baz', 'quux');\n\
   *\n\
   * @name deep\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('deep', function () {\n\
    flag(this, 'deep', true);\n\
  });\n\
\n\
  /**\n\
   * ### .a(type)\n\
   *\n\
   * The `a` and `an` assertions are aliases that can be\n\
   * used either as language chains or to assert a value's\n\
   * type.\n\
   *\n\
   *     // typeof\n\
   *     expect('test').to.be.a('string');\n\
   *     expect({ foo: 'bar' }).to.be.an('object');\n\
   *     expect(null).to.be.a('null');\n\
   *     expect(undefined).to.be.an('undefined');\n\
   *\n\
   *     // language chain\n\
   *     expect(foo).to.be.an.instanceof(Foo);\n\
   *\n\
   * @name a\n\
   * @alias an\n\
   * @param {String} type\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function an (type, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    type = type.toLowerCase();\n\
    var obj = flag(this, 'object')\n\
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';\n\
\n\
    this.assert(\n\
        type === _.type(obj)\n\
      , 'expected #{this} to be ' + article + type\n\
      , 'expected #{this} not to be ' + article + type\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('an', an);\n\
  Assertion.addChainableMethod('a', an);\n\
\n\
  /**\n\
   * ### .include(value)\n\
   *\n\
   * The `include` and `contain` assertions can be used as either property\n\
   * based language chains or as methods to assert the inclusion of an object\n\
   * in an array or a substring in a string. When used as language chains,\n\
   * they toggle the `contain` flag for the `keys` assertion.\n\
   *\n\
   *     expect([1,2,3]).to.include(2);\n\
   *     expect('foobar').to.contain('foo');\n\
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');\n\
   *\n\
   * @name include\n\
   * @alias contain\n\
   * @param {Object|String|Number} obj\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function includeChainingBehavior () {\n\
    flag(this, 'contains', true);\n\
  }\n\
\n\
  function include (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
    this.assert(\n\
        ~obj.indexOf(val)\n\
      , 'expected #{this} to include ' + _.inspect(val)\n\
      , 'expected #{this} to not include ' + _.inspect(val));\n\
  }\n\
\n\
  Assertion.addChainableMethod('include', include, includeChainingBehavior);\n\
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);\n\
\n\
  /**\n\
   * ### .ok\n\
   *\n\
   * Asserts that the target is truthy.\n\
   *\n\
   *     expect('everthing').to.be.ok;\n\
   *     expect(1).to.be.ok;\n\
   *     expect(false).to.not.be.ok;\n\
   *     expect(undefined).to.not.be.ok;\n\
   *     expect(null).to.not.be.ok;\n\
   *\n\
   * @name ok\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('ok', function () {\n\
    this.assert(\n\
        flag(this, 'object')\n\
      , 'expected #{this} to be truthy'\n\
      , 'expected #{this} to be falsy');\n\
  });\n\
\n\
  /**\n\
   * ### .true\n\
   *\n\
   * Asserts that the target is `true`.\n\
   *\n\
   *     expect(true).to.be.true;\n\
   *     expect(1).to.not.be.true;\n\
   *\n\
   * @name true\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('true', function () {\n\
    this.assert(\n\
        true === flag(this, 'object')\n\
      , 'expected #{this} to be true'\n\
      , 'expected #{this} to be false'\n\
      , this.negate ? false : true\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .false\n\
   *\n\
   * Asserts that the target is `false`.\n\
   *\n\
   *     expect(false).to.be.false;\n\
   *     expect(0).to.not.be.false;\n\
   *\n\
   * @name false\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('false', function () {\n\
    this.assert(\n\
        false === flag(this, 'object')\n\
      , 'expected #{this} to be false'\n\
      , 'expected #{this} to be true'\n\
      , this.negate ? true : false\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .null\n\
   *\n\
   * Asserts that the target is `null`.\n\
   *\n\
   *     expect(null).to.be.null;\n\
   *     expect(undefined).not.to.be.null;\n\
   *\n\
   * @name null\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('null', function () {\n\
    this.assert(\n\
        null === flag(this, 'object')\n\
      , 'expected #{this} to be null'\n\
      , 'expected #{this} not to be null'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .undefined\n\
   *\n\
   * Asserts that the target is `undefined`.\n\
   *\n\
   *     expect(undefined).to.be.undefined;\n\
   *     expect(null).to.not.be.undefined;\n\
   *\n\
   * @name undefined\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('undefined', function () {\n\
    this.assert(\n\
        undefined === flag(this, 'object')\n\
      , 'expected #{this} to be undefined'\n\
      , 'expected #{this} not to be undefined'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .exist\n\
   *\n\
   * Asserts that the target is neither `null` nor `undefined`.\n\
   *\n\
   *     var foo = 'hi'\n\
   *       , bar = null\n\
   *       , baz;\n\
   *\n\
   *     expect(foo).to.exist;\n\
   *     expect(bar).to.not.exist;\n\
   *     expect(baz).to.not.exist;\n\
   *\n\
   * @name exist\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('exist', function () {\n\
    this.assert(\n\
        null != flag(this, 'object')\n\
      , 'expected #{this} to exist'\n\
      , 'expected #{this} to not exist'\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .empty\n\
   *\n\
   * Asserts that the target's length is `0`. For arrays, it checks\n\
   * the `length` property. For objects, it gets the count of\n\
   * enumerable keys.\n\
   *\n\
   *     expect([]).to.be.empty;\n\
   *     expect('').to.be.empty;\n\
   *     expect({}).to.be.empty;\n\
   *\n\
   * @name empty\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('empty', function () {\n\
    var obj = flag(this, 'object')\n\
      , expected = obj;\n\
\n\
    if (Array.isArray(obj) || 'string' === typeof object) {\n\
      expected = obj.length;\n\
    } else if (typeof obj === 'object') {\n\
      expected = Object.keys(obj).length;\n\
    }\n\
\n\
    this.assert(\n\
        !expected\n\
      , 'expected #{this} to be empty'\n\
      , 'expected #{this} not to be empty'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .arguments\n\
   *\n\
   * Asserts that the target is an arguments object.\n\
   *\n\
   *     function test () {\n\
   *       expect(arguments).to.be.arguments;\n\
   *     }\n\
   *\n\
   * @name arguments\n\
   * @alias Arguments\n\
   * @api public\n\
   */\n\
\n\
  function checkArguments () {\n\
    var obj = flag(this, 'object')\n\
      , type = Object.prototype.toString.call(obj);\n\
    this.assert(\n\
        '[object Arguments]' === type\n\
      , 'expected #{this} to be arguments but got ' + type\n\
      , 'expected #{this} to not be arguments'\n\
    );\n\
  }\n\
\n\
  Assertion.addProperty('arguments', checkArguments);\n\
  Assertion.addProperty('Arguments', checkArguments);\n\
\n\
  /**\n\
   * ### .equal(value)\n\
   *\n\
   * Asserts that the target is strictly equal (`===`) to `value`.\n\
   * Alternately, if the `deep` flag is set, asserts that\n\
   * the target is deeply equal to `value`.\n\
   *\n\
   *     expect('hello').to.equal('hello');\n\
   *     expect(42).to.equal(42);\n\
   *     expect(1).to.not.equal(true);\n\
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });\n\
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });\n\
   *\n\
   * @name equal\n\
   * @alias equals\n\
   * @alias eq\n\
   * @alias deep.equal\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEqual (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'deep')) {\n\
      return this.eql(val);\n\
    } else {\n\
      this.assert(\n\
          val === obj\n\
        , 'expected #{this} to equal #{exp}'\n\
        , 'expected #{this} to not equal #{exp}'\n\
        , val\n\
        , this._obj\n\
        , true\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('equal', assertEqual);\n\
  Assertion.addMethod('equals', assertEqual);\n\
  Assertion.addMethod('eq', assertEqual);\n\
\n\
  /**\n\
   * ### .eql(value)\n\
   *\n\
   * Asserts that the target is deeply equal to `value`.\n\
   *\n\
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });\n\
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);\n\
   *\n\
   * @name eql\n\
   * @alias eqls\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEql(obj, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    this.assert(\n\
        _.eql(obj, flag(this, 'object'))\n\
      , 'expected #{this} to deeply equal #{exp}'\n\
      , 'expected #{this} to not deeply equal #{exp}'\n\
      , obj\n\
      , this._obj\n\
      , true\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('eql', assertEql);\n\
  Assertion.addMethod('eqls', assertEql);\n\
\n\
  /**\n\
   * ### .above(value)\n\
   *\n\
   * Asserts that the target is greater than `value`.\n\
   *\n\
   *     expect(10).to.be.above(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *\n\
   * @name above\n\
   * @alias gt\n\
   * @alias greaterThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertAbove (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len > n\n\
        , 'expected #{this} to have a length above #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj > n\n\
        , 'expected #{this} to be above ' + n\n\
        , 'expected #{this} to be at most ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('above', assertAbove);\n\
  Assertion.addMethod('gt', assertAbove);\n\
  Assertion.addMethod('greaterThan', assertAbove);\n\
\n\
  /**\n\
   * ### .least(value)\n\
   *\n\
   * Asserts that the target is greater than or equal to `value`.\n\
   *\n\
   *     expect(10).to.be.at.least(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.least(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);\n\
   *\n\
   * @name least\n\
   * @alias gte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLeast (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= n\n\
        , 'expected #{this} to have a length at least #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= n\n\
        , 'expected #{this} to be at least ' + n\n\
        , 'expected #{this} to be below ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('least', assertLeast);\n\
  Assertion.addMethod('gte', assertLeast);\n\
\n\
  /**\n\
   * ### .below(value)\n\
   *\n\
   * Asserts that the target is less than `value`.\n\
   *\n\
   *     expect(5).to.be.below(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *\n\
   * @name below\n\
   * @alias lt\n\
   * @alias lessThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertBelow (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len < n\n\
        , 'expected #{this} to have a length below #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj < n\n\
        , 'expected #{this} to be below ' + n\n\
        , 'expected #{this} to be at least ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('below', assertBelow);\n\
  Assertion.addMethod('lt', assertBelow);\n\
  Assertion.addMethod('lessThan', assertBelow);\n\
\n\
  /**\n\
   * ### .most(value)\n\
   *\n\
   * Asserts that the target is less than or equal to `value`.\n\
   *\n\
   *     expect(5).to.be.at.most(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.most(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);\n\
   *\n\
   * @name most\n\
   * @alias lte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertMost (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len <= n\n\
        , 'expected #{this} to have a length at most #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj <= n\n\
        , 'expected #{this} to be at most ' + n\n\
        , 'expected #{this} to be above ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('most', assertMost);\n\
  Assertion.addMethod('lte', assertMost);\n\
\n\
  /**\n\
   * ### .within(start, finish)\n\
   *\n\
   * Asserts that the target is within a range.\n\
   *\n\
   *     expect(7).to.be.within(5,10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a length range. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name within\n\
   * @param {Number} start lowerbound inclusive\n\
   * @param {Number} finish upperbound inclusive\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('within', function (start, finish, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , range = start + '..' + finish;\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= start && len <= finish\n\
        , 'expected #{this} to have a length within ' + range\n\
        , 'expected #{this} to not have a length within ' + range\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= start && obj <= finish\n\
        , 'expected #{this} to be within ' + range\n\
        , 'expected #{this} to not be within ' + range\n\
      );\n\
    }\n\
  });\n\
\n\
  /**\n\
   * ### .instanceof(constructor)\n\
   *\n\
   * Asserts that the target is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , Chai = new Tea('chai');\n\
   *\n\
   *     expect(Chai).to.be.an.instanceof(Tea);\n\
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);\n\
   *\n\
   * @name instanceof\n\
   * @param {Constructor} constructor\n\
   * @param {String} message _optional_\n\
   * @alias instanceOf\n\
   * @api public\n\
   */\n\
\n\
  function assertInstanceOf (constructor, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var name = _.getName(constructor);\n\
    this.assert(\n\
        flag(this, 'object') instanceof constructor\n\
      , 'expected #{this} to be an instance of ' + name\n\
      , 'expected #{this} to not be an instance of ' + name\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('instanceof', assertInstanceOf);\n\
  Assertion.addMethod('instanceOf', assertInstanceOf);\n\
\n\
  /**\n\
   * ### .property(name, [value])\n\
   *\n\
   * Asserts that the target has a property `name`, optionally asserting that\n\
   * the value of that property is strictly equal to  `value`.\n\
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep\n\
   * references into objects and arrays.\n\
   *\n\
   *     // simple referencing\n\
   *     var obj = { foo: 'bar' };\n\
   *     expect(obj).to.have.property('foo');\n\
   *     expect(obj).to.have.property('foo', 'bar');\n\
   *\n\
   *     // deep referencing\n\
   *     var deepObj = {\n\
   *         green: { tea: 'matcha' }\n\
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]\n\
   *     };\n\
\n\
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');\n\
   *\n\
   * You can also use an array as the starting point of a `deep.property`\n\
   * assertion, or traverse nested arrays.\n\
   *\n\
   *     var arr = [\n\
   *         [ 'chai', 'matcha', 'konacha' ]\n\
   *       , [ { tea: 'chai' }\n\
   *         , { tea: 'matcha' }\n\
   *         , { tea: 'konacha' } ]\n\
   *     ];\n\
   *\n\
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');\n\
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');\n\
   *\n\
   * Furthermore, `property` changes the subject of the assertion\n\
   * to be the value of that property from the original object. This\n\
   * permits for further chainable assertions on that property.\n\
   *\n\
   *     expect(obj).to.have.property('foo')\n\
   *       .that.is.a('string');\n\
   *     expect(deepObj).to.have.property('green')\n\
   *       .that.is.an('object')\n\
   *       .that.deep.equals({ tea: 'matcha' });\n\
   *     expect(deepObj).to.have.property('teas')\n\
   *       .that.is.an('array')\n\
   *       .with.deep.property('[2]')\n\
   *         .that.deep.equals({ tea: 'konacha' });\n\
   *\n\
   * @name property\n\
   * @alias deep.property\n\
   * @param {String} name\n\
   * @param {Mixed} value (optional)\n\
   * @param {String} message _optional_\n\
   * @returns value of property for chaining\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('property', function (name, val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
\n\
    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '\n\
      , negate = flag(this, 'negate')\n\
      , obj = flag(this, 'object')\n\
      , value = flag(this, 'deep')\n\
        ? _.getPathValue(name, obj)\n\
        : obj[name];\n\
\n\
    if (negate && undefined !== val) {\n\
      if (undefined === value) {\n\
        msg = (msg != null) ? msg + ': ' : '';\n\
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));\n\
      }\n\
    } else {\n\
      this.assert(\n\
          undefined !== value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)\n\
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));\n\
    }\n\
\n\
    if (undefined !== val) {\n\
      this.assert(\n\
          val === value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'\n\
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'\n\
        , val\n\
        , value\n\
      );\n\
    }\n\
\n\
    flag(this, 'object', value);\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .ownProperty(name)\n\
   *\n\
   * Asserts that the target has an own property `name`.\n\
   *\n\
   *     expect('test').to.have.ownProperty('length');\n\
   *\n\
   * @name ownProperty\n\
   * @alias haveOwnProperty\n\
   * @param {String} name\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertOwnProperty (name, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        obj.hasOwnProperty(name)\n\
      , 'expected #{this} to have own property ' + _.inspect(name)\n\
      , 'expected #{this} to not have own property ' + _.inspect(name)\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('ownProperty', assertOwnProperty);\n\
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);\n\
\n\
  /**\n\
   * ### .length(value)\n\
   *\n\
   * Asserts that the target's `length` property has\n\
   * the expected value.\n\
   *\n\
   *     expect([ 1, 2, 3]).to.have.length(3);\n\
   *     expect('foobar').to.have.length(6);\n\
   *\n\
   * Can also be used as a chain precursor to a value\n\
   * comparison for the length property.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name length\n\
   * @alias lengthOf\n\
   * @param {Number} length\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLengthChain () {\n\
    flag(this, 'doLength', true);\n\
  }\n\
\n\
  function assertLength (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).to.have.property('length');\n\
    var len = obj.length;\n\
\n\
    this.assert(\n\
        len == n\n\
      , 'expected #{this} to have a length of #{exp} but got #{act}'\n\
      , 'expected #{this} to not have a length of #{act}'\n\
      , n\n\
      , len\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('length', assertLength, assertLengthChain);\n\
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);\n\
\n\
  /**\n\
   * ### .match(regexp)\n\
   *\n\
   * Asserts that the target matches a regular expression.\n\
   *\n\
   *     expect('foobar').to.match(/^foo/);\n\
   *\n\
   * @name match\n\
   * @param {RegExp} RegularExpression\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('match', function (re, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        re.exec(obj)\n\
      , 'expected #{this} to match ' + re\n\
      , 'expected #{this} not to match ' + re\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .string(string)\n\
   *\n\
   * Asserts that the string target contains another string.\n\
   *\n\
   *     expect('foobar').to.have.string('bar');\n\
   *\n\
   * @name string\n\
   * @param {String} string\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('string', function (str, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('string');\n\
\n\
    this.assert(\n\
        ~obj.indexOf(str)\n\
      , 'expected #{this} to contain ' + _.inspect(str)\n\
      , 'expected #{this} to not contain ' + _.inspect(str)\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .keys(key1, [key2], [...])\n\
   *\n\
   * Asserts that the target has exactly the given keys, or\n\
   * asserts the inclusion of some keys when using the\n\
   * `include` or `contain` modifiers.\n\
   *\n\
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);\n\
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');\n\
   *\n\
   * @name keys\n\
   * @alias key\n\
   * @param {String...|Array} keys\n\
   * @api public\n\
   */\n\
\n\
  function assertKeys (keys) {\n\
    var obj = flag(this, 'object')\n\
      , str\n\
      , ok = true;\n\
\n\
    keys = keys instanceof Array\n\
      ? keys\n\
      : Array.prototype.slice.call(arguments);\n\
\n\
    if (!keys.length) throw new Error('keys required');\n\
\n\
    var actual = Object.keys(obj)\n\
      , len = keys.length;\n\
\n\
    // Inclusion\n\
    ok = keys.every(function(key){\n\
      return ~actual.indexOf(key);\n\
    });\n\
\n\
    // Strict\n\
    if (!flag(this, 'negate') && !flag(this, 'contains')) {\n\
      ok = ok && keys.length == actual.length;\n\
    }\n\
\n\
    // Key string\n\
    if (len > 1) {\n\
      keys = keys.map(function(key){\n\
        return _.inspect(key);\n\
      });\n\
      var last = keys.pop();\n\
      str = keys.join(', ') + ', and ' + last;\n\
    } else {\n\
      str = _.inspect(keys[0]);\n\
    }\n\
\n\
    // Form\n\
    str = (len > 1 ? 'keys ' : 'key ') + str;\n\
\n\
    // Have / include\n\
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;\n\
\n\
    // Assertion\n\
    this.assert(\n\
        ok\n\
      , 'expected #{this} to ' + str\n\
      , 'expected #{this} to not ' + str\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('keys', assertKeys);\n\
  Assertion.addMethod('key', assertKeys);\n\
\n\
  /**\n\
   * ### .throw(constructor)\n\
   *\n\
   * Asserts that the function target will throw a specific error, or specific type of error\n\
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test\n\
   * for the error's message.\n\
   *\n\
   *     var err = new ReferenceError('This is a bad function.');\n\
   *     var fn = function () { throw err; }\n\
   *     expect(fn).to.throw(ReferenceError);\n\
   *     expect(fn).to.throw(Error);\n\
   *     expect(fn).to.throw(/bad function/);\n\
   *     expect(fn).to.not.throw('good function');\n\
   *     expect(fn).to.throw(ReferenceError, /bad function/);\n\
   *     expect(fn).to.throw(err);\n\
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));\n\
   *\n\
   * Please note that when a throw expectation is negated, it will check each\n\
   * parameter independently, starting with error constructor type. The appropriate way\n\
   * to check for the existence of a type of error but for a message that does not match\n\
   * is to use `and`.\n\
   *\n\
   *     expect(fn).to.throw(ReferenceError)\n\
   *        .and.not.throw(/good function/);\n\
   *\n\
   * @name throw\n\
   * @alias throws\n\
   * @alias Throw\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {String|RegExp} expected error message\n\
   * @param {String} message _optional_\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @returns error for chaining (null if no error)\n\
   * @api public\n\
   */\n\
\n\
  function assertThrows (constructor, errMsg, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('function');\n\
\n\
    var thrown = false\n\
      , desiredError = null\n\
      , name = null\n\
      , thrownError = null;\n\
\n\
    if (arguments.length === 0) {\n\
      errMsg = null;\n\
      constructor = null;\n\
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {\n\
      errMsg = constructor;\n\
      constructor = null;\n\
    } else if (constructor && constructor instanceof Error) {\n\
      desiredError = constructor;\n\
      constructor = null;\n\
      errMsg = null;\n\
    } else if (typeof constructor === 'function') {\n\
      name = (new constructor()).name;\n\
    } else {\n\
      constructor = null;\n\
    }\n\
\n\
    try {\n\
      obj();\n\
    } catch (err) {\n\
      // first, check desired error\n\
      if (desiredError) {\n\
        this.assert(\n\
            err === desiredError\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp}'\n\
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
        flag(this, 'object', err);\n\
\n\
        return this;\n\
      }\n\
      // next, check constructor\n\
      if (constructor) {\n\
        this.assert(\n\
            err instanceof constructor\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'\n\
          , name\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
\n\
        if (!errMsg) {\n\
          flag(this, 'object', err);\n\
          return this;\n\
        }\n\
      }\n\
      // next, check message\n\
      var message = 'object' === _.type(err) && \"message\" in err\n\
        ? err.message\n\
        : '' + err;\n\
\n\
      if ((message != null) && errMsg && errMsg instanceof RegExp) {\n\
        this.assert(\n\
            errMsg.exec(message)\n\
          , 'expected #{this} to throw error matching #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not matching #{exp}'\n\
          , errMsg\n\
          , message\n\
        );\n\
        flag(this, 'object', err);\n\
\n\
        return this;\n\
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {\n\
        this.assert(\n\
            ~message.indexOf(errMsg)\n\
          , 'expected #{this} to throw error including #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not including #{act}'\n\
          , errMsg\n\
          , message\n\
        );\n\
        flag(this, 'object', err);\n\
\n\
        return this;\n\
      } else {\n\
        thrown = true;\n\
        thrownError = err;\n\
      }\n\
    }\n\
\n\
    var actuallyGot = ''\n\
      , expectedThrown = name !== null\n\
        ? name\n\
        : desiredError\n\
          ? '#{exp}' //_.inspect(desiredError)\n\
          : 'an error';\n\
\n\
    if (thrown) {\n\
      actuallyGot = ' but #{act} was thrown'\n\
    }\n\
\n\
    this.assert(\n\
        thrown === true\n\
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot\n\
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot\n\
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)\n\
    );\n\
    flag(this, 'object', null);\n\
  };\n\
\n\
  Assertion.addMethod('throw', assertThrows);\n\
  Assertion.addMethod('throws', assertThrows);\n\
  Assertion.addMethod('Throw', assertThrows);\n\
\n\
  /**\n\
   * ### .respondTo(method)\n\
   *\n\
   * Asserts that the object or class target will respond to a method.\n\
   *\n\
   *     Klass.prototype.bar = function(){};\n\
   *     expect(Klass).to.respondTo('bar');\n\
   *     expect(obj).to.respondTo('bar');\n\
   *\n\
   * To check if a constructor will respond to a static function,\n\
   * set the `itself` flag.\n\
   *\n\
   *     Klass.baz = function(){};\n\
   *     expect(Klass).itself.to.respondTo('baz');\n\
   *\n\
   * @name respondTo\n\
   * @param {String} method\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('respondTo', function (method, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , itself = flag(this, 'itself')\n\
      , context = ('function' === _.type(obj) && !itself)\n\
        ? obj.prototype[method]\n\
        : obj[method];\n\
\n\
    this.assert(\n\
        'function' === typeof context\n\
      , 'expected #{this} to respond to ' + _.inspect(method)\n\
      , 'expected #{this} to not respond to ' + _.inspect(method)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .itself\n\
   *\n\
   * Sets the `itself` flag, later used by the `respondTo` assertion.\n\
   *\n\
   *     function Foo() {}\n\
   *     Foo.bar = function() {}\n\
   *     Foo.prototype.baz = function() {}\n\
   *\n\
   *     expect(Foo).itself.to.respondTo('bar');\n\
   *     expect(Foo).itself.not.to.respondTo('baz');\n\
   *\n\
   * @name itself\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('itself', function () {\n\
    flag(this, 'itself', true);\n\
  });\n\
\n\
  /**\n\
   * ### .satisfy(method)\n\
   *\n\
   * Asserts that the target passes a given truth test.\n\
   *\n\
   *     expect(1).to.satisfy(function(num) { return num > 0; });\n\
   *\n\
   * @name satisfy\n\
   * @param {Function} matcher\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('satisfy', function (matcher, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        matcher(obj)\n\
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)\n\
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)\n\
      , this.negate ? false : true\n\
      , matcher(obj)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .closeTo(expected, delta)\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     expect(1.5).to.be.closeTo(1, 0.5);\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('closeTo', function (expected, delta, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        Math.abs(obj - expected) <= delta\n\
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta\n\
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta\n\
    );\n\
  });\n\
\n\
  function isSubsetOf(subset, superset) {\n\
    return subset.every(function(elem) {\n\
      return superset.indexOf(elem) !== -1;\n\
    })\n\
  }\n\
\n\
  /**\n\
   * ### .members(set)\n\
   *\n\
   * Asserts that the target is a superset of `set`,\n\
   * or that the target and `set` have the same members.\n\
   *\n\
   *     expect([1, 2, 3]).to.include.members([3, 2]);\n\
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);\n\
   *\n\
   *     expect([4, 2]).to.have.members([2, 4]);\n\
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);\n\
   *\n\
   * @name members\n\
   * @param {Array} set\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('members', function (subset, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
\n\
    new Assertion(obj).to.be.an('array');\n\
    new Assertion(subset).to.be.an('array');\n\
\n\
    if (flag(this, 'contains')) {\n\
      return this.assert(\n\
          isSubsetOf(subset, obj)\n\
        , 'expected #{this} to be a superset of #{act}'\n\
        , 'expected #{this} to not be a superset of #{act}'\n\
        , obj\n\
        , subset\n\
      );\n\
    }\n\
\n\
    this.assert(\n\
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)\n\
        , 'expected #{this} to have the same members as #{act}'\n\
        , 'expected #{this} to not have the same members as #{act}'\n\
        , obj\n\
        , subset\n\
    );\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/core/assertions.js"
));
require.register("chaijs-chai/lib/chai/interface/assert.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
\n\
module.exports = function (chai, util) {\n\
\n\
  /*!\n\
   * Chai dependencies.\n\
   */\n\
\n\
  var Assertion = chai.Assertion\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  /**\n\
   * ### assert(expression, message)\n\
   *\n\
   * Write your own test expressions.\n\
   *\n\
   *     assert('foo' !== 'bar', 'foo is not bar');\n\
   *     assert(Array.isArray([]), 'empty arrays are arrays');\n\
   *\n\
   * @param {Mixed} expression to test for truthiness\n\
   * @param {String} message to display on error\n\
   * @name assert\n\
   * @api public\n\
   */\n\
\n\
  var assert = chai.assert = function (express, errmsg) {\n\
    var test = new Assertion(null);\n\
    test.assert(\n\
        express\n\
      , errmsg\n\
      , '[ negation message unavailable ]'\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .fail(actual, expected, [message], [operator])\n\
   *\n\
   * Throw a failure. Node.js `assert` module-compatible.\n\
   *\n\
   * @name fail\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @param {String} operator\n\
   * @api public\n\
   */\n\
\n\
  assert.fail = function (actual, expected, message, operator) {\n\
    throw new chai.AssertionError({\n\
        actual: actual\n\
      , expected: expected\n\
      , message: message\n\
      , operator: operator\n\
      , stackStartFunction: assert.fail\n\
    });\n\
  };\n\
\n\
  /**\n\
   * ### .ok(object, [message])\n\
   *\n\
   * Asserts that `object` is truthy.\n\
   *\n\
   *     assert.ok('everything', 'everything is ok');\n\
   *     assert.ok(false, 'this will fail');\n\
   *\n\
   * @name ok\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.ok = function (val, msg) {\n\
    new Assertion(val, msg).is.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .notOk(object, [message])\n\
   *\n\
   * Asserts that `object` is falsy.\n\
   *\n\
   *     assert.notOk('everything', 'this will fail');\n\
   *     assert.notOk(false, 'this will pass');\n\
   *\n\
   * @name notOk\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notOk = function (val, msg) {\n\
    new Assertion(val, msg).is.not.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .equal(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict equality (`==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.equal(3, '3', '== coerces values to strings');\n\
   *\n\
   * @name equal\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.equal = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp == flag(test, 'object')\n\
      , 'expected #{this} to equal #{exp}'\n\
      , 'expected #{this} to not equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .notEqual(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notEqual(3, 4, 'these numbers are not equal');\n\
   *\n\
   * @name notEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notEqual = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp != flag(test, 'object')\n\
      , 'expected #{this} to not equal #{exp}'\n\
      , 'expected #{this} to equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .strictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict equality (`===`) of `actual` and `expected`.\n\
   *\n\
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');\n\
   *\n\
   * @name strictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.strictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notStrictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict inequality (`!==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');\n\
   *\n\
   * @name notStrictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notStrictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .deepEqual(actual, expected, [message])\n\
   *\n\
   * Asserts that `actual` is deeply equal to `expected`.\n\
   *\n\
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });\n\
   *\n\
   * @name deepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepEqual(actual, expected, [message])\n\
   *\n\
   * Assert that `actual` is not deeply equal to `expected`.\n\
   *\n\
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });\n\
   *\n\
   * @name notDeepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .isTrue(value, [message])\n\
   *\n\
   * Asserts that `value` is true.\n\
   *\n\
   *     var teaServed = true;\n\
   *     assert.isTrue(teaServed, 'the tea has been served');\n\
   *\n\
   * @name isTrue\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isTrue = function (val, msg) {\n\
    new Assertion(val, msg).is['true'];\n\
  };\n\
\n\
  /**\n\
   * ### .isFalse(value, [message])\n\
   *\n\
   * Asserts that `value` is false.\n\
   *\n\
   *     var teaServed = false;\n\
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');\n\
   *\n\
   * @name isFalse\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFalse = function (val, msg) {\n\
    new Assertion(val, msg).is['false'];\n\
  };\n\
\n\
  /**\n\
   * ### .isNull(value, [message])\n\
   *\n\
   * Asserts that `value` is null.\n\
   *\n\
   *     assert.isNull(err, 'there was no error');\n\
   *\n\
   * @name isNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNull = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNull(value, [message])\n\
   *\n\
   * Asserts that `value` is not null.\n\
   *\n\
   *     var tea = 'tasty chai';\n\
   *     assert.isNotNull(tea, 'great, time for tea!');\n\
   *\n\
   * @name isNotNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNull = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isUndefined(value, [message])\n\
   *\n\
   * Asserts that `value` is `undefined`.\n\
   *\n\
   *     var tea;\n\
   *     assert.isUndefined(tea, 'no tea defined');\n\
   *\n\
   * @name isUndefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isUndefined = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isDefined(value, [message])\n\
   *\n\
   * Asserts that `value` is not `undefined`.\n\
   *\n\
   *     var tea = 'cup of chai';\n\
   *     assert.isDefined(tea, 'tea has been defined');\n\
   *\n\
   * @name isDefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isDefined = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is a function.\n\
   *\n\
   *     function serveTea() { return 'cup of tea'; };\n\
   *     assert.isFunction(serveTea, 'great, we can have tea now');\n\
   *\n\
   * @name isFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a function.\n\
   *\n\
   *     var serveTea = [ 'heat', 'pour', 'sip' ];\n\
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');\n\
   *\n\
   * @name isNotFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isObject(value, [message])\n\
   *\n\
   * Asserts that `value` is an object (as revealed by\n\
   * `Object.prototype.toString`).\n\
   *\n\
   *     var selection = { name: 'Chai', serve: 'with spices' };\n\
   *     assert.isObject(selection, 'tea selection is an object');\n\
   *\n\
   * @name isObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isObject = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotObject(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an object.\n\
   *\n\
   *     var selection = 'chai'\n\
   *     assert.isObject(selection, 'tea selection is not an object');\n\
   *     assert.isObject(null, 'null is not an object');\n\
   *\n\
   * @name isNotObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotObject = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isArray(value, [message])\n\
   *\n\
   * Asserts that `value` is an array.\n\
   *\n\
   *     var menu = [ 'green', 'chai', 'oolong' ];\n\
   *     assert.isArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isArray = function (val, msg) {\n\
    new Assertion(val, msg).to.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotArray(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an array.\n\
   *\n\
   *     var menu = 'green|chai|oolong';\n\
   *     assert.isNotArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isNotArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotArray = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isString(value, [message])\n\
   *\n\
   * Asserts that `value` is a string.\n\
   *\n\
   *     var teaOrder = 'chai';\n\
   *     assert.isString(teaOrder, 'order placed');\n\
   *\n\
   * @name isString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isString = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotString(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a string.\n\
   *\n\
   *     var teaOrder = 4;\n\
   *     assert.isNotString(teaOrder, 'order placed');\n\
   *\n\
   * @name isNotString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotString = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is a number.\n\
   *\n\
   *     var cups = 2;\n\
   *     assert.isNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNumber\n\
   * @param {Number} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a number.\n\
   *\n\
   *     var cups = '2 cups please';\n\
   *     assert.isNotNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNotNumber\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is a boolean.\n\
   *\n\
   *     var teaReady = true\n\
   *       , teaServed = false;\n\
   *\n\
   *     assert.isBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a boolean.\n\
   *\n\
   *     var teaReady = 'yep'\n\
   *       , teaServed = 'nope';\n\
   *\n\
   *     assert.isNotBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isNotBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isNotBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .typeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');\n\
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');\n\
   *     assert.typeOf('tea', 'string', 'we have a string');\n\
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');\n\
   *     assert.typeOf(null, 'null', 'we have a null');\n\
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');\n\
   *\n\
   * @name typeOf\n\
   * @param {Mixed} value\n\
   * @param {String} name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.typeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notTypeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is _not_ `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');\n\
   *\n\
   * @name notTypeOf\n\
   * @param {Mixed} value\n\
   * @param {String} typeof name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notTypeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .instanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts that `value` is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new Tea('chai');\n\
   *\n\
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');\n\
   *\n\
   * @name instanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.instanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notInstanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts `value` is not an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new String('chai');\n\
   *\n\
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');\n\
   *\n\
   * @name notInstanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInstanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .include(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` includes `needle`. Works\n\
   * for strings and arrays.\n\
   *\n\
   *     assert.include('foobar', 'bar', 'foobar contains string \"bar\"');\n\
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');\n\
   *\n\
   * @name include\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.include = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.include\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .notInclude(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` does not include `needle`. Works\n\
   * for strings and arrays.\n\
   *i\n\
   *     assert.notInclude('foobar', 'baz', 'string not include substring');\n\
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');\n\
   *\n\
   * @name notInclude\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInclude = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.not.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.not.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.notInclude\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .match(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` matches the regular expression `regexp`.\n\
   *\n\
   *     assert.match('foobar', /^foo/, 'regexp matches');\n\
   *\n\
   * @name match\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.match = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .notMatch(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` does not match the regular expression `regexp`.\n\
   *\n\
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');\n\
   *\n\
   * @name notMatch\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notMatch = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.not.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .property(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`.\n\
   *\n\
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');\n\
   *\n\
   * @name property\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.property = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`.\n\
   *\n\
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');\n\
   *\n\
   * @name notProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .deepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, which can be a\n\
   * string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');\n\
   *\n\
   * @name deepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`, which\n\
   * can be a string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');\n\
   *\n\
   * @name notDeepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`.\n\
   *\n\
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');\n\
   *\n\
   * @name propertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`.\n\
   *\n\
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');\n\
   *\n\
   * @name propertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`. `property` can use dot- and bracket-notation for deep\n\
   * reference.\n\
   *\n\
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');\n\
   *\n\
   * @name deepPropertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`. `property` can use dot- and\n\
   * bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');\n\
   *\n\
   * @name deepPropertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .lengthOf(object, length, [message])\n\
   *\n\
   * Asserts that `object` has a `length` property with the expected value.\n\
   *\n\
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');\n\
   *     assert.lengthOf('foobar', 5, 'string has length of 6');\n\
   *\n\
   * @name lengthOf\n\
   * @param {Mixed} object\n\
   * @param {Number} length\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.lengthOf = function (exp, len, msg) {\n\
    new Assertion(exp, msg).to.have.length(len);\n\
  };\n\
\n\
  /**\n\
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])\n\
   *\n\
   * Asserts that `function` will throw an error that is an instance of\n\
   * `constructor`, or alternately that it will throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.throw(fn, 'function throws a reference error');\n\
   *     assert.throw(fn, /function throws a reference error/);\n\
   *     assert.throw(fn, ReferenceError);\n\
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');\n\
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);\n\
   *\n\
   * @name throws\n\
   * @alias throw\n\
   * @alias Throw\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.Throw = function (fn, errt, errs, msg) {\n\
    if ('string' === typeof errt || errt instanceof RegExp) {\n\
      errs = errt;\n\
      errt = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.Throw(errt, errs);\n\
  };\n\
\n\
  /**\n\
   * ### .doesNotThrow(function, [constructor/regexp], [message])\n\
   *\n\
   * Asserts that `function` will _not_ throw an error that is an instance of\n\
   * `constructor`, or alternately that it will not throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.doesNotThrow(fn, Error, 'function does not throw');\n\
   *\n\
   * @name doesNotThrow\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.doesNotThrow = function (fn, type, msg) {\n\
    if ('string' === typeof type) {\n\
      msg = type;\n\
      type = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.not.Throw(type);\n\
  };\n\
\n\
  /**\n\
   * ### .operator(val1, operator, val2, [message])\n\
   *\n\
   * Compares two values using `operator`.\n\
   *\n\
   *     assert.operator(1, '<', 2, 'everything is ok');\n\
   *     assert.operator(1, '>', 2, 'this will fail');\n\
   *\n\
   * @name operator\n\
   * @param {Mixed} val1\n\
   * @param {String} operator\n\
   * @param {Mixed} val2\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.operator = function (val, operator, val2, msg) {\n\
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {\n\
      throw new Error('Invalid operator \"' + operator + '\"');\n\
    }\n\
    var test = new Assertion(eval(val + operator + val2), msg);\n\
    test.assert(\n\
        true === flag(test, 'object')\n\
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)\n\
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );\n\
  };\n\
\n\
  /**\n\
   * ### .closeTo(actual, expected, delta, [message])\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} actual\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.closeTo = function (act, exp, delta, msg) {\n\
    new Assertion(act, msg).to.be.closeTo(exp, delta);\n\
  };\n\
\n\
  /**\n\
   * ### .sameMembers(set1, set2, [message])\n\
   *\n\
   * Asserts that `set1` and `set2` have the same members.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');\n\
   *\n\
   * @name sameMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.sameMembers = function (set1, set2, msg) {\n\
    new Assertion(set1, msg).to.have.same.members(set2);\n\
  }\n\
\n\
  /**\n\
   * ### .includeMembers(superset, subset, [message])\n\
   *\n\
   * Asserts that `subset` is included in `superset`.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');\n\
   *\n\
   * @name includeMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.includeMembers = function (superset, subset, msg) {\n\
    new Assertion(superset, msg).to.include.members(subset);\n\
  }\n\
\n\
  /*!\n\
   * Undocumented / untested\n\
   */\n\
\n\
  assert.ifError = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.ok;\n\
  };\n\
\n\
  /*!\n\
   * Aliases.\n\
   */\n\
\n\
  (function alias(name, as){\n\
    assert[as] = assert[name];\n\
    return alias;\n\
  })\n\
  ('Throw', 'throw')\n\
  ('Throw', 'throws');\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/assert.js"
));
require.register("chaijs-chai/lib/chai/interface/expect.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  chai.expect = function (val, message) {\n\
    return new chai.Assertion(val, message);\n\
  };\n\
};\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/expect.js"
));
require.register("chaijs-chai/lib/chai/interface/should.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  var Assertion = chai.Assertion;\n\
\n\
  function loadShould () {\n\
    // modify Object.prototype to have `should`\n\
    Object.defineProperty(Object.prototype, 'should',\n\
      {\n\
        set: function (value) {\n\
          // See https://github.com/chaijs/chai/issues/86: this makes\n\
          // `whatever.should = someValue` actually set `someValue`, which is\n\
          // especially useful for `global.should = require('chai').should()`.\n\
          //\n\
          // Note that we have to use [[DefineProperty]] instead of [[Put]]\n\
          // since otherwise we would trigger this very setter!\n\
          Object.defineProperty(this, 'should', {\n\
            value: value,\n\
            enumerable: true,\n\
            configurable: true,\n\
            writable: true\n\
          });\n\
        }\n\
      , get: function(){\n\
          if (this instanceof String || this instanceof Number) {\n\
            return new Assertion(this.constructor(this));\n\
          } else if (this instanceof Boolean) {\n\
            return new Assertion(this == true);\n\
          }\n\
          return new Assertion(this);\n\
        }\n\
      , configurable: true\n\
    });\n\
\n\
    var should = {};\n\
\n\
    should.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.equal(val2);\n\
    };\n\
\n\
    should.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.Throw(errt, errs);\n\
    };\n\
\n\
    should.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.exist;\n\
    }\n\
\n\
    // negation\n\
    should.not = {}\n\
\n\
    should.not.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.not.equal(val2);\n\
    };\n\
\n\
    should.not.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.not.Throw(errt, errs);\n\
    };\n\
\n\
    should.not.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.not.exist;\n\
    }\n\
\n\
    should['throw'] = should['Throw'];\n\
    should.not['throw'] = should.not['Throw'];\n\
\n\
    return should;\n\
  };\n\
\n\
  chai.should = loadShould;\n\
  chai.Should = loadShould;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/should.js"
));
require.register("chaijs-chai/lib/chai/utils/addChainableMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addChainingMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Module variables\n\
 */\n\
\n\
// Check whether `__proto__` is supported\n\
var hasProtoSupport = '__proto__' in Object;\n\
\n\
// Without `__proto__` support, this module will need to add properties to a function.\n\
// However, some Function.prototype methods cannot be overwritten,\n\
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).\n\
var excludeNames = /^(?:length|name|arguments|caller)$/;\n\
\n\
// Cache `Function` properties\n\
var call  = Function.prototype.call,\n\
    apply = Function.prototype.apply;\n\
\n\
/**\n\
 * ### addChainableMethod (ctx, name, method, chainingBehavior)\n\
 *\n\
 * Adds a method to an object, such that the method can also be chained.\n\
 *\n\
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);\n\
 *\n\
 * The result can then be used as both a method assertion, executing both `method` and\n\
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *     expect(fooStr).to.be.foo.equal('foo');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for `name`, when called\n\
 * @param {Function} chainingBehavior function to be called every time the property is accessed\n\
 * @name addChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  if (typeof chainingBehavior !== 'function') {\n\
    chainingBehavior = function () { };\n\
  }\n\
\n\
  var chainableBehavior = {\n\
      method: method\n\
    , chainingBehavior: chainingBehavior\n\
  };\n\
\n\
  // save the methods so we can overwrite them later, if we need to.\n\
  if (!ctx.__methods) {\n\
    ctx.__methods = {};\n\
  }\n\
  ctx.__methods[name] = chainableBehavior;\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        chainableBehavior.chainingBehavior.call(this);\n\
\n\
        var assert = function () {\n\
          var result = chainableBehavior.method.apply(this, arguments);\n\
          return result === undefined ? this : result;\n\
        };\n\
\n\
        // Use `__proto__` if available\n\
        if (hasProtoSupport) {\n\
          // Inherit all properties from the object by replacing the `Function` prototype\n\
          var prototype = assert.__proto__ = Object.create(this);\n\
          // Restore the `call` and `apply` methods from `Function`\n\
          prototype.call = call;\n\
          prototype.apply = apply;\n\
        }\n\
        // Otherwise, redefine all properties (slow!)\n\
        else {\n\
          var asserterNames = Object.getOwnPropertyNames(ctx);\n\
          asserterNames.forEach(function (asserterName) {\n\
            if (!excludeNames.test(asserterName)) {\n\
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);\n\
              Object.defineProperty(assert, asserterName, pd);\n\
            }\n\
          });\n\
        }\n\
\n\
        transferFlags(this, assert);\n\
        return assert;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addChainableMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .addMethod (ctx, name, method)\n\
 *\n\
 * Adds a method to the prototype of an object.\n\
 *\n\
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for name\n\
 * @name addMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  ctx[name] = function () {\n\
    var result = method.apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - addProperty utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### addProperty (ctx, name, getter)\n\
 *\n\
 * Adds a property to the prototype of an object.\n\
 *\n\
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.instanceof(Foo);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.foo;\n\
 *\n\
 * @param {Object} ctx object to which the property is added\n\
 * @param {String} name of property to add\n\
 * @param {Function} getter function to be used for name\n\
 * @name addProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter.call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/flag.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### flag(object ,key, [value])\n\
 *\n\
 * Get or set a flag value on an object. If a\n\
 * value is provided it will be set, else it will\n\
 * return the currently set value or `undefined` if\n\
 * the value is not set.\n\
 *\n\
 *     utils.flag(this, 'foo', 'bar'); // setter\n\
 *     utils.flag(this, 'foo'); // getter, returns `bar`\n\
 *\n\
 * @param {Object} object (constructed Assertion\n\
 * @param {String} key\n\
 * @param {Mixed} value (optional)\n\
 * @name flag\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj, key, value) {\n\
  var flags = obj.__flags || (obj.__flags = Object.create(null));\n\
  if (arguments.length === 3) {\n\
    flags[key] = value;\n\
  } else {\n\
    return flags[key];\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/flag.js"
));
require.register("chaijs-chai/lib/chai/utils/getActual.js", Function("exports, require, module",
"/*!\n\
 * Chai - getActual utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getActual(object, [actual])\n\
 *\n\
 * Returns the `actual` value for an Assertion\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var actual = args[4];\n\
  return 'undefined' !== typeof actual ? actual : obj._obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getActual.js"
));
require.register("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getEnumerableProperties utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getEnumerableProperties(object)\n\
 *\n\
 * This allows the retrieval of enumerable property names of an object,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getEnumerableProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getEnumerableProperties(object) {\n\
  var result = [];\n\
  for (var name in object) {\n\
    result.push(name);\n\
  }\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getEnumerableProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/getMessage.js", Function("exports, require, module",
"/*!\n\
 * Chai - message composition utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag')\n\
  , getActual = require('./getActual')\n\
  , inspect = require('./inspect')\n\
  , objDisplay = require('./objDisplay');\n\
\n\
/**\n\
 * ### .getMessage(object, message, negateMessage)\n\
 *\n\
 * Construct the error message based on flags\n\
 * and template tags. Template tags will return\n\
 * a stringified inspection of the object referenced.\n\
 *\n\
 * Message template tags:\n\
 * - `#{this}` current asserted object\n\
 * - `#{act}` actual value\n\
 * - `#{exp}` expected value\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 * @name getMessage\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , val = flag(obj, 'object')\n\
    , expected = args[3]\n\
    , actual = getActual(obj, args)\n\
    , msg = negate ? args[2] : args[1]\n\
    , flagMsg = flag(obj, 'message');\n\
\n\
  msg = msg || '';\n\
  msg = msg\n\
    .replace(/#{this}/g, objDisplay(val))\n\
    .replace(/#{act}/g, objDisplay(actual))\n\
    .replace(/#{exp}/g, objDisplay(expected));\n\
\n\
  return flagMsg ? flagMsg + ': ' + msg : msg;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getMessage.js"
));
require.register("chaijs-chai/lib/chai/utils/getName.js", Function("exports, require, module",
"/*!\n\
 * Chai - getName utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getName(func)\n\
 *\n\
 * Gets the name of a function, in a cross-browser way.\n\
 *\n\
 * @param {Function} a function (usually a constructor)\n\
 */\n\
\n\
module.exports = function (func) {\n\
  if (func.name) return func.name;\n\
\n\
  var match = /^\\s?function ([^(]*)\\(/.exec(func);\n\
  return match && match[1] ? match[1] : \"\";\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getName.js"
));
require.register("chaijs-chai/lib/chai/utils/getPathValue.js", Function("exports, require, module",
"/*!\n\
 * Chai - getPathValue utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * @see https://github.com/logicalparadox/filtr\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getPathValue(path, object)\n\
 *\n\
 * This allows the retrieval of values in an\n\
 * object given a string path.\n\
 *\n\
 *     var obj = {\n\
 *         prop1: {\n\
 *             arr: ['a', 'b', 'c']\n\
 *           , str: 'Hello'\n\
 *         }\n\
 *       , prop2: {\n\
 *             arr: [ { nested: 'Universe' } ]\n\
 *           , str: 'Hello again!'\n\
 *         }\n\
 *     }\n\
 *\n\
 * The following would be the results.\n\
 *\n\
 *     getPathValue('prop1.str', obj); // Hello\n\
 *     getPathValue('prop1.att[2]', obj); // b\n\
 *     getPathValue('prop2.arr[0].nested', obj); // Universe\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} object\n\
 * @returns {Object} value or `undefined`\n\
 * @name getPathValue\n\
 * @api public\n\
 */\n\
\n\
var getPathValue = module.exports = function (path, obj) {\n\
  var parsed = parsePath(path);\n\
  return _getPathValue(parsed, obj);\n\
};\n\
\n\
/*!\n\
 * ## parsePath(path)\n\
 *\n\
 * Helper function used to parse string object\n\
 * paths. Use in conjunction with `_getPathValue`.\n\
 *\n\
 *      var parsed = parsePath('myobject.property.subprop');\n\
 *\n\
 * ### Paths:\n\
 *\n\
 * * Can be as near infinitely deep and nested\n\
 * * Arrays are also valid using the formal `myobject.document[3].property`.\n\
 *\n\
 * @param {String} path\n\
 * @returns {Object} parsed\n\
 * @api private\n\
 */\n\
\n\
function parsePath (path) {\n\
  var str = path.replace(/\\[/g, '.[')\n\
    , parts = str.match(/(\\\\\\.|[^.]+?)+/g);\n\
  return parts.map(function (value) {\n\
    var re = /\\[(\\d+)\\]$/\n\
      , mArr = re.exec(value)\n\
    if (mArr) return { i: parseFloat(mArr[1]) };\n\
    else return { p: value };\n\
  });\n\
};\n\
\n\
/*!\n\
 * ## _getPathValue(parsed, obj)\n\
 *\n\
 * Helper companion function for `.parsePath` that returns\n\
 * the value located at the parsed address.\n\
 *\n\
 *      var value = getPathValue(parsed, obj);\n\
 *\n\
 * @param {Object} parsed definition from `parsePath`.\n\
 * @param {Object} object to search against\n\
 * @returns {Object|Undefined} value\n\
 * @api private\n\
 */\n\
\n\
function _getPathValue (parsed, obj) {\n\
  var tmp = obj\n\
    , res;\n\
  for (var i = 0, l = parsed.length; i < l; i++) {\n\
    var part = parsed[i];\n\
    if (tmp) {\n\
      if ('undefined' !== typeof part.p)\n\
        tmp = tmp[part.p];\n\
      else if ('undefined' !== typeof part.i)\n\
        tmp = tmp[part.i];\n\
      if (i == (l - 1)) res = tmp;\n\
    } else {\n\
      res = undefined;\n\
    }\n\
  }\n\
  return res;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getPathValue.js"
));
require.register("chaijs-chai/lib/chai/utils/getProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getProperties utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getProperties(object)\n\
 *\n\
 * This allows the retrieval of property names of an object, enumerable or not,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getProperties(object) {\n\
  var result = Object.getOwnPropertyNames(subject);\n\
\n\
  function addProperty(property) {\n\
    if (result.indexOf(property) === -1) {\n\
      result.push(property);\n\
    }\n\
  }\n\
\n\
  var proto = Object.getPrototypeOf(subject);\n\
  while (proto !== null) {\n\
    Object.getOwnPropertyNames(proto).forEach(addProperty);\n\
    proto = Object.getPrototypeOf(proto);\n\
  }\n\
\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/index.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Main exports\n\
 */\n\
\n\
var exports = module.exports = {};\n\
\n\
/*!\n\
 * test utility\n\
 */\n\
\n\
exports.test = require('./test');\n\
\n\
/*!\n\
 * type utility\n\
 */\n\
\n\
exports.type = require('./type');\n\
\n\
/*!\n\
 * message utility\n\
 */\n\
\n\
exports.getMessage = require('./getMessage');\n\
\n\
/*!\n\
 * actual utility\n\
 */\n\
\n\
exports.getActual = require('./getActual');\n\
\n\
/*!\n\
 * Inspect util\n\
 */\n\
\n\
exports.inspect = require('./inspect');\n\
\n\
/*!\n\
 * Object Display util\n\
 */\n\
\n\
exports.objDisplay = require('./objDisplay');\n\
\n\
/*!\n\
 * Flag utility\n\
 */\n\
\n\
exports.flag = require('./flag');\n\
\n\
/*!\n\
 * Flag transferring utility\n\
 */\n\
\n\
exports.transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Deep equal utility\n\
 */\n\
\n\
exports.eql = require('deep-eql');\n\
\n\
/*!\n\
 * Deep path value\n\
 */\n\
\n\
exports.getPathValue = require('./getPathValue');\n\
\n\
/*!\n\
 * Function name\n\
 */\n\
\n\
exports.getName = require('./getName');\n\
\n\
/*!\n\
 * add Property\n\
 */\n\
\n\
exports.addProperty = require('./addProperty');\n\
\n\
/*!\n\
 * add Method\n\
 */\n\
\n\
exports.addMethod = require('./addMethod');\n\
\n\
/*!\n\
 * overwrite Property\n\
 */\n\
\n\
exports.overwriteProperty = require('./overwriteProperty');\n\
\n\
/*!\n\
 * overwrite Method\n\
 */\n\
\n\
exports.overwriteMethod = require('./overwriteMethod');\n\
\n\
/*!\n\
 * Add a chainable method\n\
 */\n\
\n\
exports.addChainableMethod = require('./addChainableMethod');\n\
\n\
/*!\n\
 * Overwrite chainable method\n\
 */\n\
\n\
exports.overwriteChainableMethod = require('./overwriteChainableMethod');\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/index.js"
));
require.register("chaijs-chai/lib/chai/utils/inspect.js", Function("exports, require, module",
"// This is (almost) directly from Node.js utils\n\
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js\n\
\n\
var getName = require('./getName');\n\
var getProperties = require('./getProperties');\n\
var getEnumerableProperties = require('./getEnumerableProperties');\n\
\n\
module.exports = inspect;\n\
\n\
/**\n\
 * Echos the value of a value. Trys to print the value out\n\
 * in the best way possible given the different types.\n\
 *\n\
 * @param {Object} obj The object to print out.\n\
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)\n\
 *    properties of objects.\n\
 * @param {Number} depth Depth in which to descend in object. Default is 2.\n\
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the\n\
 *    output. Default is false (no coloring).\n\
 */\n\
function inspect(obj, showHidden, depth, colors) {\n\
  var ctx = {\n\
    showHidden: showHidden,\n\
    seen: [],\n\
    stylize: function (str) { return str; }\n\
  };\n\
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));\n\
}\n\
\n\
// https://gist.github.com/1044128/\n\
var getOuterHTML = function(element) {\n\
  if ('outerHTML' in element) return element.outerHTML;\n\
  var ns = \"http://www.w3.org/1999/xhtml\";\n\
  var container = document.createElementNS(ns, '_');\n\
  var elemProto = (window.HTMLElement || window.Element).prototype;\n\
  var xmlSerializer = new XMLSerializer();\n\
  var html;\n\
  if (document.xmlVersion) {\n\
    return xmlSerializer.serializeToString(element);\n\
  } else {\n\
    container.appendChild(element.cloneNode(false));\n\
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');\n\
    container.innerHTML = '';\n\
    return html;\n\
  }\n\
};\n\
\n\
// Returns true if object is a DOM element.\n\
var isDOMElement = function (object) {\n\
  if (typeof HTMLElement === 'object') {\n\
    return object instanceof HTMLElement;\n\
  } else {\n\
    return object &&\n\
      typeof object === 'object' &&\n\
      object.nodeType === 1 &&\n\
      typeof object.nodeName === 'string';\n\
  }\n\
};\n\
\n\
function formatValue(ctx, value, recurseTimes) {\n\
  // Provide a hook for user-specified inspect functions.\n\
  // Check that value is an object with an inspect function on it\n\
  if (value && typeof value.inspect === 'function' &&\n\
      // Filter out the util module, it's inspect function is special\n\
      value.inspect !== exports.inspect &&\n\
      // Also filter out any prototype objects using the circular check.\n\
      !(value.constructor && value.constructor.prototype === value)) {\n\
    var ret = value.inspect(recurseTimes);\n\
    if (typeof ret !== 'string') {\n\
      ret = formatValue(ctx, ret, recurseTimes);\n\
    }\n\
    return ret;\n\
  }\n\
\n\
  // Primitive types cannot have properties\n\
  var primitive = formatPrimitive(ctx, value);\n\
  if (primitive) {\n\
    return primitive;\n\
  }\n\
\n\
  // If it's DOM elem, get outer HTML.\n\
  if (isDOMElement(value)) {\n\
    return getOuterHTML(value);\n\
  }\n\
\n\
  // Look up the keys of the object.\n\
  var visibleKeys = getEnumerableProperties(value);\n\
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;\n\
\n\
  // Some type of object without properties can be shortcutted.\n\
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,\n\
  // a `stack` plus `description` property; ignore those for consistency.\n\
  if (keys.length === 0 || (isError(value) && (\n\
      (keys.length === 1 && keys[0] === 'stack') ||\n\
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')\n\
     ))) {\n\
    if (typeof value === 'function') {\n\
      var name = getName(value);\n\
      var nameSuffix = name ? ': ' + name : '';\n\
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');\n\
    }\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    }\n\
    if (isDate(value)) {\n\
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');\n\
    }\n\
    if (isError(value)) {\n\
      return formatError(value);\n\
    }\n\
  }\n\
\n\
  var base = '', array = false, braces = ['{', '}'];\n\
\n\
  // Make Array say that they are Array\n\
  if (isArray(value)) {\n\
    array = true;\n\
    braces = ['[', ']'];\n\
  }\n\
\n\
  // Make functions say that they are functions\n\
  if (typeof value === 'function') {\n\
    var name = getName(value);\n\
    var nameSuffix = name ? ': ' + name : '';\n\
    base = ' [Function' + nameSuffix + ']';\n\
  }\n\
\n\
  // Make RegExps say that they are RegExps\n\
  if (isRegExp(value)) {\n\
    base = ' ' + RegExp.prototype.toString.call(value);\n\
  }\n\
\n\
  // Make dates with properties first say the date\n\
  if (isDate(value)) {\n\
    base = ' ' + Date.prototype.toUTCString.call(value);\n\
  }\n\
\n\
  // Make error with message first say the error\n\
  if (isError(value)) {\n\
    return formatError(value);\n\
  }\n\
\n\
  if (keys.length === 0 && (!array || value.length == 0)) {\n\
    return braces[0] + base + braces[1];\n\
  }\n\
\n\
  if (recurseTimes < 0) {\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    } else {\n\
      return ctx.stylize('[Object]', 'special');\n\
    }\n\
  }\n\
\n\
  ctx.seen.push(value);\n\
\n\
  var output;\n\
  if (array) {\n\
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n\
  } else {\n\
    output = keys.map(function(key) {\n\
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n\
    });\n\
  }\n\
\n\
  ctx.seen.pop();\n\
\n\
  return reduceToSingleString(output, base, braces);\n\
}\n\
\n\
\n\
function formatPrimitive(ctx, value) {\n\
  switch (typeof value) {\n\
    case 'undefined':\n\
      return ctx.stylize('undefined', 'undefined');\n\
\n\
    case 'string':\n\
      var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                               .replace(/'/g, \"\\\\'\")\n\
                                               .replace(/\\\\\"/g, '\"') + '\\'';\n\
      return ctx.stylize(simple, 'string');\n\
\n\
    case 'number':\n\
      return ctx.stylize('' + value, 'number');\n\
\n\
    case 'boolean':\n\
      return ctx.stylize('' + value, 'boolean');\n\
  }\n\
  // For some reason typeof null is \"object\", so special case here.\n\
  if (value === null) {\n\
    return ctx.stylize('null', 'null');\n\
  }\n\
}\n\
\n\
\n\
function formatError(value) {\n\
  return '[' + Error.prototype.toString.call(value) + ']';\n\
}\n\
\n\
\n\
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n\
  var output = [];\n\
  for (var i = 0, l = value.length; i < l; ++i) {\n\
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          String(i), true));\n\
    } else {\n\
      output.push('');\n\
    }\n\
  }\n\
  keys.forEach(function(key) {\n\
    if (!key.match(/^\\d+$/)) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          key, true));\n\
    }\n\
  });\n\
  return output;\n\
}\n\
\n\
\n\
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n\
  var name, str;\n\
  if (value.__lookupGetter__) {\n\
    if (value.__lookupGetter__(key)) {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Getter/Setter]', 'special');\n\
      } else {\n\
        str = ctx.stylize('[Getter]', 'special');\n\
      }\n\
    } else {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Setter]', 'special');\n\
      }\n\
    }\n\
  }\n\
  if (visibleKeys.indexOf(key) < 0) {\n\
    name = '[' + key + ']';\n\
  }\n\
  if (!str) {\n\
    if (ctx.seen.indexOf(value[key]) < 0) {\n\
      if (recurseTimes === null) {\n\
        str = formatValue(ctx, value[key], null);\n\
      } else {\n\
        str = formatValue(ctx, value[key], recurseTimes - 1);\n\
      }\n\
      if (str.indexOf('\\n\
') > -1) {\n\
        if (array) {\n\
          str = str.split('\\n\
').map(function(line) {\n\
            return '  ' + line;\n\
          }).join('\\n\
').substr(2);\n\
        } else {\n\
          str = '\\n\
' + str.split('\\n\
').map(function(line) {\n\
            return '   ' + line;\n\
          }).join('\\n\
');\n\
        }\n\
      }\n\
    } else {\n\
      str = ctx.stylize('[Circular]', 'special');\n\
    }\n\
  }\n\
  if (typeof name === 'undefined') {\n\
    if (array && key.match(/^\\d+$/)) {\n\
      return str;\n\
    }\n\
    name = JSON.stringify('' + key);\n\
    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
      name = name.substr(1, name.length - 2);\n\
      name = ctx.stylize(name, 'name');\n\
    } else {\n\
      name = name.replace(/'/g, \"\\\\'\")\n\
                 .replace(/\\\\\"/g, '\"')\n\
                 .replace(/(^\"|\"$)/g, \"'\");\n\
      name = ctx.stylize(name, 'string');\n\
    }\n\
  }\n\
\n\
  return name + ': ' + str;\n\
}\n\
\n\
\n\
function reduceToSingleString(output, base, braces) {\n\
  var numLinesEst = 0;\n\
  var length = output.reduce(function(prev, cur) {\n\
    numLinesEst++;\n\
    if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
    return prev + cur.length + 1;\n\
  }, 0);\n\
\n\
  if (length > 60) {\n\
    return braces[0] +\n\
           (base === '' ? '' : base + '\\n\
 ') +\n\
           ' ' +\n\
           output.join(',\\n\
  ') +\n\
           ' ' +\n\
           braces[1];\n\
  }\n\
\n\
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
}\n\
\n\
function isArray(ar) {\n\
  return Array.isArray(ar) ||\n\
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');\n\
}\n\
\n\
function isRegExp(re) {\n\
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';\n\
}\n\
\n\
function isDate(d) {\n\
  return typeof d === 'object' && objectToString(d) === '[object Date]';\n\
}\n\
\n\
function isError(e) {\n\
  return typeof e === 'object' && objectToString(e) === '[object Error]';\n\
}\n\
\n\
function objectToString(o) {\n\
  return Object.prototype.toString.call(o);\n\
}\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/inspect.js"
));
require.register("chaijs-chai/lib/chai/utils/objDisplay.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var inspect = require('./inspect');\n\
\n\
/**\n\
 * ### .objDisplay (object)\n\
 *\n\
 * Determines if an object or an array matches\n\
 * criteria to be inspected in-line for error\n\
 * messages or should be truncated.\n\
 *\n\
 * @param {Mixed} javascript object to inspect\n\
 * @name objDisplay\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = inspect(obj)\n\
    , type = Object.prototype.toString.call(obj);\n\
\n\
  if (str.length >= 40) {\n\
    if (type === '[object Function]') {\n\
      return !obj.name || obj.name === ''\n\
        ? '[Function]'\n\
        : '[Function: ' + obj.name + ']';\n\
    } else if (type === '[object Array]') {\n\
      return '[ Array(' + obj.length + ') ]';\n\
    } else if (type === '[object Object]') {\n\
      var keys = Object.keys(obj)\n\
        , kstr = keys.length > 2\n\
          ? keys.splice(0, 2).join(', ') + ', ...'\n\
          : keys.join(', ');\n\
      return '{ Object (' + kstr + ') }';\n\
    } else {\n\
      return str;\n\
    }\n\
  } else {\n\
    return str;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/objDisplay.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing method and provides\n\
 * access to previous function. Must return function\n\
 * to be used for name.\n\
 *\n\
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {\n\
 *       return function (str) {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.value).to.equal(str);\n\
 *         } else {\n\
 *           _super.apply(this, arguments);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.equal('bar');\n\
 *\n\
 * @param {Object} ctx object whose method is to be overwritten\n\
 * @param {String} name of method to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @name overwriteMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  var _method = ctx[name]\n\
    , _super = function () { return this; };\n\
\n\
  if (_method && 'function' === typeof _method)\n\
    _super = _method;\n\
\n\
  ctx[name] = function () {\n\
    var result = method(_super).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteProperty utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteProperty (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing property getter and provides\n\
 * access to previous value. Must return function to use as getter.\n\
 *\n\
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {\n\
 *       return function () {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.name).to.equal('bar');\n\
 *         } else {\n\
 *           _super.call(this);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.ok;\n\
 *\n\
 * @param {Object} ctx object whose property is to be overwritten\n\
 * @param {String} name of property to overwrite\n\
 * @param {Function} getter function that returns a getter function to be used for name\n\
 * @name overwriteProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  var _get = Object.getOwnPropertyDescriptor(ctx, name)\n\
    , _super = function () {};\n\
\n\
  if (_get && 'function' === typeof _get.get)\n\
    _super = _get.get\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter(_super).call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteChainableMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteChainableMethod utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteChainableMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing chainable method\n\
 * and provides access to the previous function or\n\
 * property.  Must return functions to be used for\n\
 * name.\n\
 *\n\
 *     utils.overwriteChainableMethod(chai.Assertion.prototype, 'length',\n\
 *       function (_super) {\n\
 *       }\n\
 *     , function (_super) {\n\
 *       }\n\
 *     );\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteChainableMethod('foo', fn, fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.have.length(3);\n\
 *     expect(myFoo).to.have.length.above(3);\n\
 *\n\
 * @param {Object} ctx object whose method / property is to be overwritten\n\
 * @param {String} name of method / property to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @param {Function} chainingBehavior function that returns a function to be used for property\n\
 * @name overwriteChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  var chainableBehavior = ctx.__methods[name];\n\
\n\
  var _chainingBehavior = chainableBehavior.chainingBehavior;\n\
  chainableBehavior.chainingBehavior = function () {\n\
    var result = chainingBehavior(_chainingBehavior).call(this);\n\
    return result === undefined ? this : result;\n\
  };\n\
\n\
  var _method = chainableBehavior.method;\n\
  chainableBehavior.method = function () {\n\
    var result = method(_method).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteChainableMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/test.js", Function("exports, require, module",
"/*!\n\
 * Chai - test utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag');\n\
\n\
/**\n\
 * # test(object, expression)\n\
 *\n\
 * Test and object for expression.\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , expr = args[0];\n\
  return negate ? !expr : expr;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/test.js"
));
require.register("chaijs-chai/lib/chai/utils/transferFlags.js", Function("exports, require, module",
"/*!\n\
 * Chai - transferFlags utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### transferFlags(assertion, object, includeAll = true)\n\
 *\n\
 * Transfer all the flags for `assertion` to `object`. If\n\
 * `includeAll` is set to `false`, then the base Chai\n\
 * assertion flags (namely `object`, `ssfi`, and `message`)\n\
 * will not be transferred.\n\
 *\n\
 *\n\
 *     var newAssertion = new Assertion();\n\
 *     utils.transferFlags(assertion, newAssertion);\n\
 *\n\
 *     var anotherAsseriton = new Assertion(myObj);\n\
 *     utils.transferFlags(assertion, anotherAssertion, false);\n\
 *\n\
 * @param {Assertion} assertion the assertion to transfer the flags from\n\
 * @param {Object} object the object to transfer the flags too; usually a new assertion\n\
 * @param {Boolean} includeAll\n\
 * @name getAllFlags\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (assertion, object, includeAll) {\n\
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));\n\
\n\
  if (!object.__flags) {\n\
    object.__flags = Object.create(null);\n\
  }\n\
\n\
  includeAll = arguments.length === 3 ? includeAll : true;\n\
\n\
  for (var flag in flags) {\n\
    if (includeAll ||\n\
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {\n\
      object.__flags[flag] = flags[flag];\n\
    }\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/transferFlags.js"
));
require.register("chaijs-chai/lib/chai/utils/type.js", Function("exports, require, module",
"/*!\n\
 * Chai - type utility\n\
 * Copyright(c) 2012-2014 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Arguments]': 'arguments'\n\
  , '[object Array]': 'array'\n\
  , '[object Date]': 'date'\n\
  , '[object Function]': 'function'\n\
  , '[object Number]': 'number'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object String]': 'string'\n\
};\n\
\n\
/**\n\
 * ### type(object)\n\
 *\n\
 * Better implementation of `typeof` detection that can\n\
 * be used cross-browser. Handles the inconsistencies of\n\
 * Array, `null`, and `undefined` detection.\n\
 *\n\
 *     utils.type({}) // 'object'\n\
 *     utils.type(null) // `null'\n\
 *     utils.type(undefined) // `undefined`\n\
 *     utils.type([]) // `array`\n\
 *\n\
 * @param {Mixed} object to detect type of\n\
 * @name type\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/type.js"
));
require.register("yadda-component-browser-example/features/bottles.feature.js", Function("exports, require, module",
"module.exports = 'Feature: Mocha Asynchronous Example\\n\
\\n\
Scenario: A bottle falls from the wall\\n\
\\n\
    Given 100 green bottles are standing on the wall\\n\
    when 1 green bottle accidentally falls\\n\
    then there are 99 green bottles standing on the wall\\n\
\\n\
Scenario: No bottles are left\\n\
\\n\
    Given 1 green bottles are standing on the wall\\n\
    when 1 green bottle accidentally falls\\n\
    then there are 0 green bottles standing on the wall\\n\
\\n\
@Pending\\n\
Scenario: Bottles are reset\\n\
\\n\
\tGiven there are no green bottles\\n\
\twhen 5 minutes has elapsed\\n\
\tthen there are 100 green bottles standing on the wall\\n\
\\n\
Scenario: [N] bottles are standing on a wall\\n\
\\n\
    Given [N] green bottles are standing on the wall\\n\
    when 1 green bottle accidentally falls\\n\
    then there are [N-1] green bottles standing on the wall\\n\
\\n\
    Where:\\n\
        N   | N-1\\n\
        100 | 99\\n\
        99  | 98\\n\
        10  | 9';//@ sourceURL=yadda-component-browser-example/features/bottles.feature.js"
));
require.register("yadda-component-browser-example/bottles-library.js", Function("exports, require, module",
"var Yadda = require('yadda');\n\
var English = Yadda.localisation.English;\n\
var Dictionary = Yadda.Dictionary;\n\
var assert = require('chai').assert;\n\
\n\
module.exports = (function() {\n\
\n\
    var wall;\n\
\n\
    var dictionary = new Dictionary()\n\
        .define('NUM', /(\\d+)/);\n\
\n\
    var library = English.library(dictionary)\n\
\n\
    .given(\"$NUM green bottles are standing on the wall\", function(number_of_bottles, next) {\n\
    \twall = new Wall(number_of_bottles);\n\
        next();\n\
    })\n\
\n\
    .when(\"$NUM green bottle accidentally falls\", function(number_of_falling_bottles, next) {\n\
        wall.fall(number_of_falling_bottles);\n\
        next();\n\
    })\n\
\n\
    .then(\"there (?:are|are still) $NUM green bottles standing on the wall\", function(number_of_bottles, next) {\n\
        assert.equal(number_of_bottles, wall.bottles);\n\
        next();\n\
    })\n\
\n\
    var Wall = function(bottles) {\n\
        this.bottles = bottles;\n\
        this.fall = function(n) {\n\
            this.bottles -= n;\n\
        }\n\
        this.returned = function() {\n\
            this.bottles++;\n\
        }\n\
    }\n\
\n\
    return library;\n\
})();\n\
//@ sourceURL=yadda-component-browser-example/bottles-library.js"
));






require.alias("johntron-yadda/lib/Array.js", "yadda-component-browser-example/deps/yadda/lib/Array.js");
require.alias("johntron-yadda/lib/Competition.js", "yadda-component-browser-example/deps/yadda/lib/Competition.js");
require.alias("johntron-yadda/lib/Context.js", "yadda-component-browser-example/deps/yadda/lib/Context.js");
require.alias("johntron-yadda/lib/Dictionary.js", "yadda-component-browser-example/deps/yadda/lib/Dictionary.js");
require.alias("johntron-yadda/lib/EventBus.js", "yadda-component-browser-example/deps/yadda/lib/EventBus.js");
require.alias("johntron-yadda/lib/FeatureFileSearch.js", "yadda-component-browser-example/deps/yadda/lib/FeatureFileSearch.js");
require.alias("johntron-yadda/lib/FileSearch.js", "yadda-component-browser-example/deps/yadda/lib/FileSearch.js");
require.alias("johntron-yadda/lib/fn.js", "yadda-component-browser-example/deps/yadda/lib/fn.js");
require.alias("johntron-yadda/lib/index.js", "yadda-component-browser-example/deps/yadda/lib/index.js");
require.alias("johntron-yadda/lib/Interpreter.js", "yadda-component-browser-example/deps/yadda/lib/Interpreter.js");
require.alias("johntron-yadda/lib/LevenshteinDistanceScore.js", "yadda-component-browser-example/deps/yadda/lib/LevenshteinDistanceScore.js");
require.alias("johntron-yadda/lib/Library.js", "yadda-component-browser-example/deps/yadda/lib/Library.js");
require.alias("johntron-yadda/lib/localisation/English.js", "yadda-component-browser-example/deps/yadda/lib/localisation/English.js");
require.alias("johntron-yadda/lib/localisation/French.js", "yadda-component-browser-example/deps/yadda/lib/localisation/French.js");
require.alias("johntron-yadda/lib/localisation/index.js", "yadda-component-browser-example/deps/yadda/lib/localisation/index.js");
require.alias("johntron-yadda/lib/localisation/Language.js", "yadda-component-browser-example/deps/yadda/lib/localisation/Language.js");
require.alias("johntron-yadda/lib/localisation/Pirate.js", "yadda-component-browser-example/deps/yadda/lib/localisation/Pirate.js");
require.alias("johntron-yadda/lib/localisation/Spanish.js", "yadda-component-browser-example/deps/yadda/lib/localisation/Spanish.js");
require.alias("johntron-yadda/lib/localisation/Norwegian.js", "yadda-component-browser-example/deps/yadda/lib/localisation/Norwegian.js");
require.alias("johntron-yadda/lib/Macro.js", "yadda-component-browser-example/deps/yadda/lib/Macro.js");
require.alias("johntron-yadda/lib/parsers/FeatureParser.js", "yadda-component-browser-example/deps/yadda/lib/parsers/FeatureParser.js");
require.alias("johntron-yadda/lib/parsers/index.js", "yadda-component-browser-example/deps/yadda/lib/parsers/index.js");
require.alias("johntron-yadda/lib/parsers/StepParser.js", "yadda-component-browser-example/deps/yadda/lib/parsers/StepParser.js");
require.alias("johntron-yadda/lib/plugins/CasperPlugin.js", "yadda-component-browser-example/deps/yadda/lib/plugins/CasperPlugin.js");
require.alias("johntron-yadda/lib/plugins/index.js", "yadda-component-browser-example/deps/yadda/lib/plugins/index.js");
require.alias("johntron-yadda/lib/plugins/MochaPlugin.js", "yadda-component-browser-example/deps/yadda/lib/plugins/MochaPlugin.js");
require.alias("johntron-yadda/lib/RegularExpression.js", "yadda-component-browser-example/deps/yadda/lib/RegularExpression.js");
require.alias("johntron-yadda/lib/shims/index.js", "yadda-component-browser-example/deps/yadda/lib/shims/index.js");
require.alias("johntron-yadda/lib/shims/phantom-fs.js", "yadda-component-browser-example/deps/yadda/lib/shims/phantom-fs.js");
require.alias("johntron-yadda/lib/shims/phantom-path.js", "yadda-component-browser-example/deps/yadda/lib/shims/phantom-path.js");
require.alias("johntron-yadda/lib/shims/phantom-process.js", "yadda-component-browser-example/deps/yadda/lib/shims/phantom-process.js");
require.alias("johntron-yadda/lib/Yadda.js", "yadda-component-browser-example/deps/yadda/lib/Yadda.js");
require.alias("johntron-yadda/lib/index.js", "yadda-component-browser-example/deps/yadda/index.js");
require.alias("johntron-yadda/lib/index.js", "yadda/index.js");
require.alias("johntron-yadda/lib/index.js", "johntron-yadda/index.js");
require.alias("chaijs-chai/index.js", "yadda-component-browser-example/deps/chai/index.js");
require.alias("chaijs-chai/lib/chai.js", "yadda-component-browser-example/deps/chai/lib/chai.js");
require.alias("chaijs-chai/lib/chai/assertion.js", "yadda-component-browser-example/deps/chai/lib/chai/assertion.js");
require.alias("chaijs-chai/lib/chai/core/assertions.js", "yadda-component-browser-example/deps/chai/lib/chai/core/assertions.js");
require.alias("chaijs-chai/lib/chai/interface/assert.js", "yadda-component-browser-example/deps/chai/lib/chai/interface/assert.js");
require.alias("chaijs-chai/lib/chai/interface/expect.js", "yadda-component-browser-example/deps/chai/lib/chai/interface/expect.js");
require.alias("chaijs-chai/lib/chai/interface/should.js", "yadda-component-browser-example/deps/chai/lib/chai/interface/should.js");
require.alias("chaijs-chai/lib/chai/utils/addChainableMethod.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/addChainableMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addMethod.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/addMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addProperty.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/addProperty.js");
require.alias("chaijs-chai/lib/chai/utils/flag.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/flag.js");
require.alias("chaijs-chai/lib/chai/utils/getActual.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getActual.js");
require.alias("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getEnumerableProperties.js");
require.alias("chaijs-chai/lib/chai/utils/getMessage.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getMessage.js");
require.alias("chaijs-chai/lib/chai/utils/getName.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getName.js");
require.alias("chaijs-chai/lib/chai/utils/getPathValue.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getPathValue.js");
require.alias("chaijs-chai/lib/chai/utils/getProperties.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/getProperties.js");
require.alias("chaijs-chai/lib/chai/utils/index.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/index.js");
require.alias("chaijs-chai/lib/chai/utils/inspect.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/inspect.js");
require.alias("chaijs-chai/lib/chai/utils/objDisplay.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/objDisplay.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteMethod.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/overwriteMethod.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteProperty.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/overwriteProperty.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteChainableMethod.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/overwriteChainableMethod.js");
require.alias("chaijs-chai/lib/chai/utils/test.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/test.js");
require.alias("chaijs-chai/lib/chai/utils/transferFlags.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/transferFlags.js");
require.alias("chaijs-chai/lib/chai/utils/type.js", "yadda-component-browser-example/deps/chai/lib/chai/utils/type.js");
require.alias("chaijs-chai/index.js", "yadda-component-browser-example/deps/chai/index.js");
require.alias("chaijs-chai/index.js", "chai/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-assertion-error/index.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-chai/deps/deep-eql/lib/eql.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-chai/deps/deep-eql/index.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/lib/type.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/index.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-type-detect/index.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-deep-eql/index.js");
require.alias("chaijs-chai/index.js", "chaijs-chai/index.js");