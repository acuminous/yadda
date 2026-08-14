const $ = require('./Array');
const RegularExpression = require('./RegularExpression');
const pass_through_converter = require('./converters/pass-through-converter');

// Understands term definitions
const Dictionary = function (prefix = '$') {
  const definitions = {};
  const term_grouping_pattern = new RegularExpression(new RegExp(`(?:^|[^\\\\])\\${prefix}(\\w+)`, 'g'));
  const term_splitting_pattern = new RegExp(`(\\${prefix}\\w+)`);
  const _this = this;

  this.define = function (term, pattern, converters) {
    if (is_defined(term)) throw new Error(`Duplicate term: [${term}]`);
    if (converters && is_expandable(pattern)) throw new Error(`Expandable terms cannot use converters: [${term}]`);
    if (converters && !is_compatible(converters, pattern)) throw new Error(`Wrong number of converters for: [${term}]`);

    if (!is_expandable(pattern) && !converters) converters = get_matching_group_converters(pattern);
    definitions[term] = { pattern: normalise(pattern), converters: $(converters) };
    return this;
  };

  this.merge = function (other) {
    if (other._prefix() !== this._prefix()) throw new Error('Cannot merge dictionaries with different prefixes');
    return new Dictionary(prefix)._merge(this)._merge(other);
  };

  this._merge = function (other) {
    other.each((term, definition) => {
      _this.define(term, definition.pattern);
    });
    return this;
  };

  this._prefix = () => prefix;

  this.each = (callback) => {
    for (const term in definitions) {
      callback(term, definitions[term]);
    }
  };

  this.expand = (signature, already_expanding) => {
    const text = normalise(signature);
    return is_expandable(text) ? { pattern: expand_sub_terms(text, $(already_expanding)), converters: get_converters(text) } : { pattern: text, converters: get_converters(text) };
  };

  function expand_sub_terms(text, already_expanding) {
    return get_sub_terms(text).each((sub_term) => {
      if (already_expanding.in_array(sub_term)) throw new Error(`Circular Definition: [${already_expanding.join(', ')}]`);
      const sub_term_grouping_pattern = expand_sub_term(sub_term, already_expanding);
      text = text.replace(prefix + sub_term, sub_term_grouping_pattern);
      return text;
    });
  }

  function get_sub_terms(text) {
    return term_grouping_pattern.groups(text);
  }

  function expand_sub_term(sub_term, already_expanding) {
    const pattern = definitions[sub_term] ? definitions[sub_term].pattern : '(.+)';
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
    return $(text.split(term_splitting_pattern)).inject($(), (converters, fragment) => converters.push_all(is_expandable(fragment) ? get_sub_term_converters(fragment) : get_matching_group_converters(fragment)));
  }

  function get_matching_group_converters(text) {
    return $().fill(pass_through_converter, count_matching_groups(text));
  }

  function get_sub_term_converters(text) {
    return get_sub_terms(text).inject($(), (converters, sub_term) => (is_defined(sub_term) ? converters.push_all(definitions[sub_term].converters) : converters.push_all(get_converters(expand_sub_term(sub_term, [])))));
  }

  function count_matching_groups(pattern) {
    return new RegExp(`${pattern}|`).exec('').length - 1;
  }

  function count_converter_arguments(converters) {
    return $(converters).inject(0, (sum, converter) => sum + converter.length - 1);
  }
};

module.exports = Dictionary;
