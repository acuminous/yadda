const { describe, it } = require('node:test');
const { equal: eq, ok, throws } = require('node:assert');
const { Library, localisation } = require('../lib/index');
const { English } = localisation;
const Dictionary = require('../lib/Dictionary');
const fn = require('../lib/fn');

describe('Library', () => {
  it('should hold String mapped macros', () => {
    const library = new Library().define('foo');
    ok(library.get_macro('foo'), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
  });

  it('should hold RegExp mapped macros', () => {
    const library = new Library().define(/bar/);
    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro('bar'), 'Macro should have been defined');
  });

  it('should support aliased macros', () => {
    const library = new Library().define([/bar/, /foo/]);
    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
  });

  it('should hold String mapped macros when options are specified', () => {
    const library = new Library().define('foo', fn.noop, {}, {});
    ok(library.get_macro('foo'), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
  });

  it('should hold RegExp mapped macros when options are specified', () => {
    const library = new Library().define(/bar/, fn.noop, {}, {});

    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro('bar'), 'Macro should have been defined');
  });

  it('should support aliased macros when options are specified', () => {
    const library = new Library().define([/bar/, /foo/], {}, { mode: 'async' });
    ok(library.get_macro(/bar/), 'Macro should have been defined');
    ok(library.get_macro(/foo/), 'Macro should have been defined');
  });

  it('should expand macro signature using specified dictionary', () => {
    const dictionary = new Dictionary().define('gender', '(male|female)').define('speciality', '(cardiovascular|elderly care)');

    const library = new Library(dictionary).define('Given a $gender, $speciality patient called $name');

    const macro = library.get_macro('Given a $gender, $speciality patient called $name');
    ok(macro.can_interpret('Given a male, cardiovascular patient called Bob'));
    ok(macro.can_interpret('Given a female, elderly care patient called Carol'));
    ok(!macro.can_interpret('Given a ugly, angry patient called Max'));
  });

  it('should report duplicate macros', () => {
    const library = English.localise(new Library()).define(/bar/);

    throws(() => {
      library.define(/bar/);
    }, /Duplicate macro: \[\/bar\/\]/);
  });

  it('should find all compatible macros', () => {
    const library = new Library()
      .define(/^food$/)
      .define(/^foo.*$/)
      .define(/^f.*$/);

    eq(library.find_compatible_macros('fort').length, 1);
    eq(library.find_compatible_macros('foodie').length, 2);
    eq(library.find_compatible_macros('food').length, 3);
  });

  it('should be localised', () => {
    const library = English.localise(new Library())
      .given(/^a wall with (\d+) bottles/)
      .when(/^(\d+) bottle(?:s)? accidentally falls/)
      .then(/^there are (\d+) bottles left/);

    const givens = ['Given a wall with 100 bottles', 'given a wall with 100 bottles', 'And a wall with 100 bottles', 'and a wall with 100 bottles', 'with   a wall with 100 bottles'];

    const whens = ['When 1 bottle accidentally falls', 'when 1 bottle accidentally falls', 'and 1 bottle accidentally falls', 'And 1 bottle accidentally falls', 'but  1 bottle accidentally falls'];

    const thens = ['Then there are 99 bottles left', 'then there are 99 bottles left', 'And there are 99 bottles left', 'and there are 99 bottles left', 'Expect there are 99 bottles left', 'expect there are 99 bottles left', 'but  there are 99 bottles left'];

    assert_localisation(library, givens, '/^(?:\\s)*(?:[Gg]iven|[Ww]ith|[Aa]nd|[Bb]ut|[Ee]xcept)\\s+a wall with (\\d+) bottles/');
    assert_localisation(library, whens, '/^(?:\\s)*(?:[Ww]hen|[Ii]f|[Aa]nd|[Bb]ut)\\s+(\\d+) bottle(?:s)? accidentally falls/');
    assert_localisation(library, thens, '/^(?:\\s)*(?:[Tt]hen|[Ee]xpect|[Aa]nd|[Bb]ut)\\s+there are (\\d+) bottles left/');
  });

  it('should supports localised aliased macros', () => {
    const library = English.localise(new Library())
      .given([/^a wall with (\d+) bottles/, /^a wall with (\d+) green bottles/])
      .when([/^(\d+) bottle(?:s)? accidentally falls/, /^(\d+) green bottle(?:s)? accidentally falls/])
      .then([/^there are (\d+) bottles left/, /^there are (\d+) green bottles left/]);

    eq(library.find_compatible_macros('Given a wall with 100 bottles').length, 1);
    eq(library.find_compatible_macros('Given a wall with 100 green bottles').length, 1);
    eq(library.find_compatible_macros('When 1 bottle accidentally falls').length, 1);
    eq(library.find_compatible_macros('When 1 green bottle accidentally falls').length, 1);
    eq(library.find_compatible_macros('Then there are 99 bottles left').length, 1);
    eq(library.find_compatible_macros('Then there are 99 green bottles left').length, 1);
  });

  it('should expand multiline macro signature using specified dictionary', () => {
    const dictionary = new Dictionary().define('text', /([^\u0000]*)/);

    const library = new Library(dictionary).define('Given a text $text');

    const macro = library.get_macro('Given a text $text');
    ok(macro.can_interpret('Given a text ')); // empty
    ok(macro.can_interpret('Given a text 1')); // oneline
    ok(macro.can_interpret('Given a text 1\n2\n3')); // multiline
    ok(!macro.can_interpret('Given another thing'));
  });

  function assert_localisation(library, statements, signature) {
    for (let i = 0; i < statements.length; i++) {
      eq(library.find_compatible_macros(statements[i]).length, 1, statements[i]);
      eq(library.find_compatible_macros(statements[i])[0].toString(), signature, statements[i]);
    }
  }
});
