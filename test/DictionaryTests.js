const { describe, it } = require('node:test');
const { equal: eq, throws } = require('node:assert');
const { Dictionary } = require('../lib/index');
const pass_through_converter = require('../lib/converters/pass-through-converter');

describe('Dictionary', () => {
  it('should default to a wild card match', () => {
    assert_pattern(new Dictionary(), '$missing', '(.+)');
  });

  it('should expand simple terms', () => {
    const dictionary = new Dictionary().define('gender', '(male|female)').define('speciality', /(cardiovascular|elderly care)/);

    assert_pattern(dictionary, '$gender', '(male|female)');
    assert_pattern(dictionary, '$speciality', '(cardiovascular|elderly care)');
    assert_pattern(dictionary, 'Given a $gender, $speciality patient called $name', 'Given a (male|female), (cardiovascular|elderly care) patient called (.+)');
  });

  it('should expand complex terms', () => {
    const dictionary = new Dictionary().define('address_line_1', '$number $street').define('number', /(\d+)/).define('street', /(\w+)/);

    assert_pattern(dictionary, '$address_line_1', '(\\d+) (\\w+)');
  });

  it('should report duplicate terms', () => {
    const dictionary = new Dictionary().define('gender', '(male|female)');

    throws(() => {
      dictionary.define('gender', 'anything');
    }, /Duplicate term: \[gender\]/);
  });

  it('should report cyclic definitions', () => {
    const dictionary = new Dictionary().define('direct', '$direct').define('indirect', '$intermediary').define('intermediary', '$indirect');

    throws(() => {
      dictionary.expand('$direct');
    }, /Circular Definition: \[direct\]/);

    throws(() => {
      dictionary.expand('$indirect');
    }, /Circular Definition: \[indirect, intermediary\]/);
  });

  it('should merge with another dictionary', () => {
    const dictionary1 = new Dictionary().define('gender', /(male|female)/);
    const dictionary2 = new Dictionary().define('speciality', /(cardiovascular|elderly care)/);
    const dictionary3 = dictionary1.merge(dictionary2);

    assert_pattern(dictionary3, '$gender', '(male|female)');
    assert_pattern(dictionary3, '$speciality', '(cardiovascular|elderly care)');
  });

  it('should maintain prefix when merging dictionaries', () => {
    const dictionary1 = new Dictionary(':').define('gender', /(male|female)/);
    const dictionary2 = new Dictionary(':').merge(dictionary1);
    assert_pattern(dictionary2, ':gender', '(male|female)');
  });

  it('should not merge dictionaries with different prefixes', () => {
    const dictionary1 = new Dictionary('$');
    const dictionary2 = new Dictionary(':');

    throws(() => {
      dictionary1.merge(dictionary2);
    }, /Cannot merge dictionaries with different prefixes/);
  });

  it('should report duplicate terms in merged dictionaries', () => {
    const dictionary1 = new Dictionary().define('gender', /(male|female)/);
    const dictionary2 = new Dictionary().define('gender', /(male|female)/);

    throws(() => {
      dictionary1.merge(dictionary2);
    }, /Duplicate term: \[gender\]/);
  });

  it('should return a pass through converter each matching group', () => {
    const dictionary = new Dictionary();
    assert_converters(dictionary, /(1) (2) (3)/, [pass_through_converter, pass_through_converter, pass_through_converter]);
  });

  it('should return a pass through converter each undefined term', () => {
    const dictionary = new Dictionary();
    assert_converters(dictionary, '$foo $bar', [pass_through_converter, pass_through_converter]);
  });

  it('should default to the pass through converter for each matching group in a defined pattern', () => {
    const dictionary = new Dictionary().define('foo', /(1)/).define('bar', /(2) (3)/);
    assert_converters(dictionary, '$foo $bar', [pass_through_converter, pass_through_converter, pass_through_converter]);
  });

  it('should use the specified converters when specified', () => {
    const converter1 = function a(_value, _cb) {};
    const converter2 = function b(_value, _cb) {};
    const dictionary = new Dictionary().define('foo', /(1)/, converter1).define('bar', /(2) (3)/, [converter1, converter2]);
    assert_converters(dictionary, '$foo $bar', [converter1, converter1, converter2]);
  });

  it('should allow patterns and terms to be mixed in the same signature', () => {
    const converter1 = function a(_value, _cb) {};
    const converter2 = function b(_value, _cb) {};
    const dictionary = new Dictionary().define('foo', /(1)/, converter1).define('bar', /(2) (3)/, [converter1, converter2]);
    assert_converters(dictionary, '(1) $foo (2) (3) $bar (4) $baz', [pass_through_converter, converter1, pass_through_converter, pass_through_converter, converter1, converter2, pass_through_converter, pass_through_converter]);
  });

  it('should report expandable terms with converters', () => {
    throws(() => {
      new Dictionary().define('address_line_1', '$number $street', pass_through_converter);
    }, /Expandable terms cannot use converters: \[address_line_1\]/);
  });

  it('should report terms with wrong number of converters for matching groups', () => {
    throws(() => {
      new Dictionary().define('foo', '(1)', [pass_through_converter, pass_through_converter]);
    }, /Wrong number of converters for: \[foo\]/);
  });

  it('should support multi-arg converters', () => {
    const two_arg_converter = (_a, _b, _cb) => {};

    const dictionary = new Dictionary().define('foo', '(1) (2)', [two_arg_converter]);
    assert_converters(dictionary, '$foo', [two_arg_converter]);
  });

  it('should report multi-arg converters with the wrong number of matching groups', () => {
    const two_arg_converter = (_a, _b, _cb) => {};

    throws(() => {
      new Dictionary().define('foo', '(1)', [two_arg_converter]);
    }, /Wrong number of converters for: \[foo\]/);
  });

  it('should support async converters', () => {
    const async_converter = async (_a) => {};

    const dictionary = new Dictionary().define('foo', '(1)', [async_converter]);
    assert_converters(dictionary, '$foo', [async_converter]);
  });

  it('should support multi-arg async converters', () => {
    const two_arg_async_converter = async (_a, _b) => {};

    const dictionary = new Dictionary().define('foo', '(1) (2)', [two_arg_async_converter]);
    assert_converters(dictionary, '$foo', [two_arg_async_converter]);
  });

  it('should report async converters with the wrong number of matching groups', () => {
    const two_arg_async_converter = async (_a, _b) => {};

    throws(() => {
      new Dictionary().define('foo', '(1)', [two_arg_async_converter]);
    }, /Wrong number of converters for: \[foo\]/);
  });

  function assert_pattern(dictionary, pattern, expected) {
    eq(dictionary.expand(pattern).pattern, expected);
  }

  function assert_converters(dictionary, pattern, expected) {
    const converters = dictionary.expand(pattern).converters;
    eq(converters.length, expected.length);
    for (let i = 0; i < expected.length; i++) {
      eq(converters[i].toString(), expected[i].toString());
    }
  }
});
